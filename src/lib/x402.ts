import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { x402ResourceServer, withX402 } from "@x402/next";
import { NextRequest, NextResponse } from "next/server";
import { PRICES_USDC, OWNER_LOCK } from "./config";
import { recordSettlement } from "./indexer";

export const BASE_NETWORK = "eip155:8453";
export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

type PaidServiceHandler = (request: NextRequest) => Promise<NextResponse>;

function facilitatorUrl(): string | null {
  const raw = process.env.X402_FACILITATOR_URL;
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") return null;
    if (
      process.env.NODE_ENV === "production" &&
      parsed.hostname === "x402.org"
    ) return null; // public facilitator is not the production default
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function createResourceServer() {
  const url = facilitatorUrl();
  if (!url) throw new Error("X402_FACILITATOR_URL is missing or not approved for this environment");

  const facilitator = new HTTPFacilitatorClient({ url });
  return new x402ResourceServer(facilitator).register(
    BASE_NETWORK,
    new ExactEvmScheme()
  );
}

function decodePaymentResponse(encoded: string): unknown {
  // x402 v2 transport uses a Base64-encoded PAYMENT-RESPONSE JSON value.
  const json = Buffer.from(encoded, "base64").toString("utf8");
  return JSON.parse(json) as unknown;
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
      (typeof candidate.payer === "string" &&
        /^0x[0-9a-fA-F]{40}$/.test(candidate.payer)))
  );
}

/**
 * Wrap a paid agent capability with the official x402 v2 Next.js adapter.
 * The SDK constructs canonical requirements, parses PAYMENT-SIGNATURE,
 * calls the configured facilitator, and settles according to its scheme.
 *
 * This wrapper refuses to offer paid service unless durable settlement storage
 * is configured. It records only successful SDK settlement responses and
 * relies on a database uniqueness constraint for replay/idempotency.
 */
export function withPaidAgentService(
  price: number,
  resource: keyof typeof PRICES_USDC | string,
  description: string,
  handler: PaidServiceHandler
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: "Durable settlement storage is required before paid fulfillment",
        code: "X402_DURABLE_STORAGE_NOT_CONFIGURED",
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
          payTo: OWNER_LOCK.base,
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

    if (!isSettlementResponse(settlement)) {
      return NextResponse.json({
        error: "Payment settlement is not confirmed for the expected Base network",
        code: "X402_SETTLEMENT_UNCONFIRMED",
      }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }

    try {
      await recordSettlement({
        txHash: settlement.transaction,
        amount: price,
        chain: BASE_NETWORK,
        resource,
        payTo: OWNER_LOCK.base,
        asset: BASE_USDC,
        payer: settlement.payer,
      });
    } catch {
      // Settlement may already be on-chain. Do not claim it was recorded.
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
