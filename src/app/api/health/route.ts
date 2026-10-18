import { getStats } from "@/lib/indexer";
import { OWNER_LOCK, APP_NAME } from "@/lib/config";

export async function GET() {
  const stats = await getStats();
  return Response.json({
    status: "ok",
    app: APP_NAME,
    owner: OWNER_LOCK,
    settlements: stats,
    timestamp: new Date().toISOString(),
  });
}
