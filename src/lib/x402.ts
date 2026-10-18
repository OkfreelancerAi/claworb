import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { x402ResourceServer, withX402 } from "@x402/next";
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, decodeEventLog, http, isAddress, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { PRICES_USDC } from "./config";
import { recordSettlement } from "./indexer";

export const BASE_NETWORK = "eip155:8453";
export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const TRANSFER_EVENT = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

type PaidServiceHandler = (request: NextRequest) => Promise<NextResponse>;

function configuredPayTo(): `0x${string}` | null {
  const value = process.env.X402_PAY_TO?.trim();
  if (!value || !isAddress(value)) return null;
  return value as `0x${string}`;
}

function facilitatorUrl(): string | null {
  const raw = process.env.X402_FACILITATOR_URL;
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") return null;
    if (process.env.NODE_ENV === "production" && parsed.hostname === "x402.org") return null;
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function createResourceServer() {
  const url = facilitatorUrl();
  if (!url) throw new Error("X402_FACILITATOR_URL is missing or not approved for this environment");
  const facilitator = new HTTPFacilitatorClient({ url });
  return new x402ResourceServer(facilitator).register(BASE_NETWORK, new ExactEvmScheme());
}

function decodePaymentResponse(encoded: string): unknown {
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as unknown;
}

function isSettlementResponse(value: unknown): value is {
  success: boolean;
  transaction: string;
  network: string;
  payer?: string;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.success === true &&
    typeof candidate.transaction === "string" &&
    /^0x[0-9a-fA-F]{64}$/.test(candidate.transaction) &&
    candidate.network === BASE_NETWORK &&
    (candidate.payer === undefined ||
      (typeof candidate.payer === "string" && /^0x[0-9a-fA-F]{40}$/.test(candidate.payer)))
  );
}

async function verifyOnChainTransfer(
  txHash: string,
  priceUsdc: number,
  expectedPayer: string,
  expectedRecipient: string
): Promise<boolean> {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) return false;

  try {
    const client = createPublicClient({ chain: base, transport: http(rpcUrl, { timeout: 10_000 }) });
    if (await client.getChainId() !== 8453) return false;

    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    if (receipt.status !== "success") return false;

    const expectedValue = BigInt(Math.round(priceUsdc * 1_000_000));
    const expectedRecipientLower = expectedRecipient.toLowerCase();
    const expectedSender = expectedPayer.toLowerCase();

    return receipt.logs.some((log) => {
      if (log.address.toLowerCase() !== BASE_USDC.toLowerCase()) return false;
      try {
        const decoded = decodeEventLog({
          abi: [TRANSFER_EVENT],
          data: log.data,
          topics: log.topics,
        });
        return decoded.eventName === "Transfer" &&
          decoded.args.to.toLowerCase() === expectedRecipientLower &&
          decoded.args.value === expectedValue &&
          decoded.args.from.toLowerCase() === expectedSender;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Official x402 v2 wrapper. The SDK owns challenge construction, payment-payload
 * parsing, facilitator verification, and settlement. We additionally verify the
 * confirmed Base receipt contains the exact USDC Transfer to our configured
 * recipient for the advertised amount before recording the event.
 */
export function withPaidAgentService(
  price: number,
  resource: keyof typeof PRICES_USDC | string,
  description: string,
  handler: PaidServiceHandler
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const payTo = configuredPayTo();
    if (!payTo) {
      return NextResponse.json({
        error: "A valid X402_PAY_TO recipient address must be configured before paid fulfillment",
        code: "X402_RECIPIENT_NOT_CONFIGURED",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: "Durable settlement storage is required before paid fulfillment",
        code: "X402_DURABLE_STORAGE_NOT_CONFIGURED",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    if (!process.env.BASE_RPC_URL) {
      return NextResponse.json({
        error: "A Base mainnet RPC URL is required for on-chain settlement verification",
        code: "X402_BASE_RPC_NOT_CONFIGURED",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    let server;
    try {
      server = createResourceServer();
    } catch {
      return NextResponse.json({
        error: "A production-compatible x402 facilitator is not configured",
        code: "X402_FACILITATOR_NOT_CONFIGURED",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    const protectedHandler = withX402(
      handler,
      {
        accepts: [{
          scheme: "exact",
          price: `$${price.toFixed(2)}`,
          network: BASE_NETWORK,
          payTo,
          maxTimeoutSeconds: 60,
        }],
        description,
      },
      server
    );

    const response = await protectedHandler(request);
    if (!response.ok) return response;

    const encodedSettlement = response.headers.get("PAYMENT-RESPONSE");
    if (!encodedSettlement) {
      return NextResponse.json({
        error: "The x402 SDK returned success without a settlement receipt",
        code: "X402_SETTLEMENT_RECEIPT_MISSING",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    let settlement: unknown;
    try {
      settlement = decodePaymentResponse(encodedSettlement);
    } catch {
      return NextResponse.json({
        error: "Malformed x402 settlement receipt",
        code: "X402_SETTLEMENT_RECEIPT_INVALID",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    if (!isSettlementResponse(settlement) || !settlement.payer) {
      return NextResponse.json({
        error: "Payment settlement is not confirmed for the expected Base network",
        code: "X402_SETTLEMENT_UNCONFIRMED",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    const onChainMatch = await verifyOnChainTransfer(
      settlement.transaction,
      price,
      settlement.payer,
      payTo
    );
    if (!onChainMatch) {
      return NextResponse.json({
        error: "The settlement receipt could not be matched to the expected confirmed Base USDC transfer",
        code: "X402_ONCHAIN_TRANSFER_MISMATCH",
        txHash: settlement.transaction,
        network: settlement.network,
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    try {
      await recordSettlement({
        txHash: settlement.transaction,
        amount: price,
        chain: BASE_NETWORK,
        resource,
        payTo,
        asset: BASE_USDC,
        payer: settlement.payer,
      });
    } catch {
      return NextResponse.json({
        error: "Payment settled, but durable earnings recording failed; reconcile this transaction before retrying",
        code: "X402_SETTLED_RECORDING_FAILED",
        txHash: settlement.transaction,
        network: settlement.network,
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    return response;
  };
}
