import { APP_NAME } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = {
    durableStorageConfigured: Boolean(process.env.DATABASE_URL),
    baseRpcConfigured: Boolean(process.env.BASE_RPC_URL),
    facilitatorConfigured: Boolean(process.env.X402_FACILITATOR_URL),
    recipientConfigured: Boolean(process.env.X402_PAY_TO),
  };
  const paidReady = Object.values(checks).every(Boolean);

  return Response.json(
    {
      status: paidReady ? "configured" : "degraded",
      app: APP_NAME,
      paidServices: paidReady ? "configuration_present_not_live_verified" : "disabled_until_configured",
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: paidReady ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
