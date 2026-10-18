import { requirePayment } from "@/lib/x402";
import { recordSettlement } from "@/lib/indexer";
import { OWNER_LOCK } from "@/lib/config";

export async function GET(request: Request) {
  const result = await requirePayment(request.headers, "earn");

  if (!result.paid) return result.response;

  // Never record a settlement without a real transaction hash from the
  // facilitator and a successful on-chain settlement result.
  if (!result.txHash || !/^0x[0-9a-fA-F]{64}$/.test(result.txHash)) {
    return Response.json({
      error: "Settlement not confirmed",
      code: "X402_SETTLEMENT_UNCONFIRMED",
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  await recordSettlement({
    txHash: result.txHash,
    amount: result.amount,
    chain: "base",
    resource: "earn",
    payTo: OWNER_LOCK.base,
  });

  return Response.json({
    ok: true,
    message: "ClawOrb earn skill executed",
    insight: "Agent pipeline placeholder — SCOUT → EXECUTOR would run here",
    txHash: result.txHash,
    amountUsdc: result.amount,
    chain: "base",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
