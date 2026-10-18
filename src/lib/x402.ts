/**
 * x402 helpers (skeleton).
 * In production, integrate a real facilitator or full verification logic.
 */

import { PRICES_USDC, OWNER_LOCK, CHAINS } from "./config";

export function paymentRequiredResponse(endpoint: keyof typeof PRICES_USDC) {
  const amount = PRICES_USDC[endpoint];
  return {
    status: 402,
    body: {
      x402Version: 1,
      accepts: CHAINS.map((chain) => ({
        scheme: "exact",
        network: chain,
        maxAmountRequired: String(amount),
        resource: endpoint,
        payTo: chain === "base" ? OWNER_LOCK.base : OWNER_LOCK.solanaTreasury,
        asset: "USDC",
      })),
    },
  };
}

export function hasValidPaymentHeader(headers: Headers): boolean {
  // Skeleton only — replace with real signature / facilitator verification
  const proof = headers.get("X-PAYMENT") || headers.get("X-Payment-Proof");
  return Boolean(proof && proof.length > 20);
}
