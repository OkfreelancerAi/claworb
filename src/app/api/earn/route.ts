import { requirePayment } from "@/lib/x402";
import { recordSettlement } from "@/lib/indexer";
import { OWNER_LOCK } from "@/lib/config";

export async function GET(request: Request) {
  const result = await requirePayment(request.headers, "earn");

  if (!result.paid) {
    return result.response;
  }

  // Record the settlement
  await recordSettlement({
    txHash: result.txHash || "unknown",
    amount: 0.05,
    chain: "base", // simplified — detect from proof in production
    resource: "earn",
    payTo: OWNER_LOCK.base,
  });

  return Response.json({
    ok: true,
    message: "ClawOrb earn skill executed",
    insight: "Agent pipeline placeholder — SCOUT → EXECUTOR would run here",
    txHash: result.txHash,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
