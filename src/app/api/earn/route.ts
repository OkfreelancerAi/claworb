import { NextRequest, NextResponse } from "next/server";
import { PRICES_USDC } from "@/lib/config";
import { withPaidAgentService } from "@/lib/x402";

const handler = async (_request: NextRequest) => {
  return NextResponse.json({
    ok: true,
    service: "claworb-agent-execution",
    result: {
      status: "capability_ready",
      supportedCapabilities: [
        "evidence-pack-quality-check",
        "agent-opportunity-triage",
        "structured-task-specification",
      ],
      note: "This endpoint confirms service execution only; it does not claim third-party research, wallet analysis, or revenue that was not performed.",
    },
    timestamp: new Date().toISOString(),
  });
};

const paidHandler = withPaidAgentService(
  PRICES_USDC.earn,
  "earn",
  "ClawOrb agent capability execution",
  handler
);

export async function GET(request: NextRequest) {
  return paidHandler(request);
}

export async function POST(request: NextRequest) {
  return paidHandler(request);
}
