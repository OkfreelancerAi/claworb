/**
 * ClawOrb x402 provider guard.
 *
 * IMPORTANT: This scaffold does not yet implement the complete x402 v1
 * PaymentPayload + facilitator /verify + /settle handshake. Fail closed until
 * that integration is implemented. Never treat a payment header's presence as
 * proof of payment, and never synthesize transaction hashes.
 */
import { PRICES_USDC, OWNER_LOCK } from "./config";

const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export interface PaymentAccept {
  scheme: "exact";
  network: "base";
  maxAmountRequired: string;
  resource: string;
  payTo: string;
  asset: string;
  description: string;
}

export function buildPaymentRequired(
  endpoint: keyof typeof PRICES_USDC,
  description?: string
) {
  const amount = PRICES_USDC[endpoint];
  // x402 v1 EVM token amounts use the token's smallest units (USDC: 6 decimals).
  const amountAtomic = BigInt(Math.round(amount * 1_000_000)).toString();
  const accepts: PaymentAccept[] = amount > 0 ? [{
    scheme: "exact",
    network: "base",
    maxAmountRequired: amountAtomic,
    resource: endpoint,
    payTo: OWNER_LOCK.base,
    asset: BASE_USDC,
    description: description || `ClawOrb ${endpoint}`,
  }] : [];

  return {
    x402Version: 1,
    error: "Payment Required",
    accepts,
    _meta: {
      chainId: BASE_MAINNET_CHAIN_ID,
      status: "provider_settlement_integration_required",
    },
  };
}

export function extractPaymentProof(headers: Headers): string | null {
  return headers.get("PAYMENT-SIGNATURE") || headers.get("X-PAYMENT") || null;
}

export async function requirePayment(
  headers: Headers,
  endpoint: keyof typeof PRICES_USDC
): Promise<{ paid: true; txHash: string; amount: number } | { paid: false; response: Response }> {
  const proof = extractPaymentProof(headers);

  if (!proof) {
    return {
      paid: false,
      response: new Response(JSON.stringify(buildPaymentRequired(endpoint)), {
        status: 402,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      }),
    };
  }

  // A header is not evidence of payment. This repository currently lacks the
  // complete, scheme-aware x402 PaymentPayload verification AND settlement flow.
  // Do not accept requests or record revenue until that implementation exists.
  return {
    paid: false,
    response: new Response(JSON.stringify({
      error: "Payment verification and settlement are not configured",
      code: "X402_PROVIDER_NOT_READY",
      message: "No payment was accepted or recorded. Configure a compatible x402 v1 Base facilitator and implement /verify plus /settle before enabling paid fulfillment.",
    }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }),
  };
}
