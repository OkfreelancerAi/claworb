/**
 * ClawOrb x402 — facilitator-ready payment helpers
 * Supports dual-chain (Base + Solana) USDC via HTTP 402
 */

import { PRICES_USDC, OWNER_LOCK, CHAINS } from "./config";

export type Chain = (typeof CHAINS)[number];

export interface PaymentAccept {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  payTo: string;
  asset: string;
  description?: string;
}

export function buildPaymentRequired(
  endpoint: keyof typeof PRICES_USDC,
  description?: string
) {
  const amount = PRICES_USDC[endpoint];
  const accepts: PaymentAccept[] = CHAINS.map((chain) => ({
    scheme: "exact",
    network: chain === "base" ? "base" : "solana",
    maxAmountRequired: amount.toFixed(6),
    resource: endpoint,
    payTo: chain === "base" ? OWNER_LOCK.base : OWNER_LOCK.solanaTreasury,
    asset: "USDC",
    description: description || `ClawOrb ${endpoint}`,
  }));

  return {
    x402Version: 1,
    error: "Payment Required",
    accepts,
  };
}

/**
 * Check for payment proof header.
 * In production, pass the proof to a facilitator for cryptographic verification.
 */
export function extractPaymentProof(headers: Headers): string | null {
  return (
    headers.get("X-PAYMENT") ||
    headers.get("X-Payment-Proof") ||
    headers.get("PAYMENT-SIGNATURE") ||
    null
  );
}

export function hasPaymentProof(headers: Headers): boolean {
  const proof = extractPaymentProof(headers);
  return Boolean(proof && proof.length > 20);
}

/**
 * Verify payment via facilitator (skeleton).
 * Set FACILITATOR_URL in env for real verification.
 */
export async function verifyWithFacilitator(
  proof: string,
  expectedAmount: number,
  resource: string
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  const facilitator = process.env.FACILITATOR_URL;

  if (!facilitator) {
    // Development fallback — accept any non-empty proof
    console.warn("[x402] No FACILITATOR_URL set — using dev accept");
    return { valid: true, txHash: "dev-" + proof.slice(0, 16) };
  }

  try {
    const res = await fetch(`${facilitator}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proof,
        expectedAmount,
        resource,
        payTo: [OWNER_LOCK.base, OWNER_LOCK.solanaTreasury],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { valid: false, error: text || `Facilitator ${res.status}` };
    }

    const data = await res.json();
    return {
      valid: Boolean(data.valid || data.verified),
      txHash: data.txHash || data.transaction,
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Facilitator unreachable",
    };
  }
}

export async function requirePayment(
  headers: Headers,
  endpoint: keyof typeof PRICES_USDC
): Promise<{ paid: true; txHash?: string } | { paid: false; response: Response }> {
  const proof = extractPaymentProof(headers);

  if (!proof) {
    const body = buildPaymentRequired(endpoint);
    return {
      paid: false,
      response: new Response(JSON.stringify(body), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const result = await verifyWithFacilitator(
    proof,
    PRICES_USDC[endpoint],
    endpoint
  );

  if (!result.valid) {
    return {
      paid: false,
      response: new Response(
        JSON.stringify({ error: "Invalid payment", detail: result.error }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      ),
    };
  }

  return { paid: true, txHash: result.txHash };
}
