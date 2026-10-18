import { NextResponse } from "next/server";
import { PRICES_USDC } from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    network: "eip155:8453",
    asset: "USDC",
    settlement: "x402-v2",
    services: [
      {
        id: "evidence-check",
        endpoint: "/api/agent/evidence-check",
        method: "POST",
        priceUsdc: PRICES_USDC.evidenceCheck,
        description: "Check whether a claim's evidence pack is complete and link-shaped. Does not assert factual truth.",
      },
      {
        id: "opportunity-score",
        endpoint: "/api/agent/opportunity-score",
        method: "POST",
        priceUsdc: PRICES_USDC.opportunityScore,
        description: "Transparent heuristic triage using only the opportunity inputs supplied by the caller.",
      },
      {
        id: "task-spec",
        endpoint: "/api/agent/task-spec",
        method: "POST",
        priceUsdc: PRICES_USDC.taskSpec,
        description: "Turn a goal into a structured, testable agent task specification.",
      },
      {
        id: "earn",
        endpoint: "/api/earn",
        method: "POST",
        priceUsdc: PRICES_USDC.earn,
        description: "ClawOrb agent capability execution status and supported capability metadata.",
      },
    ],
    caveats: [
      "Prices are configured offers, not evidence of sales or earnings.",
      "Paid endpoints remain disabled until a production facilitator URL and durable Postgres database are configured.",
      "A successful service response is not a guarantee of financial return.",
    ],
  });
}
