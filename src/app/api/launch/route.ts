import { NextResponse } from "next/server";
import { missingEnvs } from "@/lib/ensureConfig";
import { OWNER_LOCK } from "@/lib/config";

export async function GET() {
  const missing = missingEnvs();
  const result: any = {
    ok: missing.length === 0,
    requiredEnvPresent: missing.length === 0,
    missingEnv: missing,
    timestamp: new Date().toISOString(),
    ownerLock: OWNER_LOCK,
    checks: {
      database: { configured: false, ok: null, error: null },
      baseRpc: { configured: false, ok: null, error: null, chainId: null },
      facilitator: { configured: false, ok: null, error: null, status: null },
      payTo: { configured: false, matchesOwnerLock: null, value: process.env.X402_PAY_TO || null },
    },
  };

  // payTo check
  if (process.env.X402_PAY_TO) {
    result.checks.payTo.configured = true;
    try {
      const normalized = String(process.env.X402_PAY_TO).trim().toLowerCase();
      const ownerBase = String(OWNER_LOCK.base).toLowerCase();
      result.checks.payTo.matchesOwnerLock = normalized === ownerBase;
    } catch (err: any) {
      result.checks.payTo.matchesOwnerLock = null;
      result.checks.payTo.error = String(err.message || err);
    }
  }

  // DB check
  if (process.env.DATABASE_URL) {
    result.checks.database.configured = true;
    try {
      const { default: PgPool } = await import('pg');
      const pool = new PgPool.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });
      const res = await pool.query('SELECT 1');
      await pool.end();
      result.checks.database.ok = true;
    } catch (err: any) {
      result.checks.database.ok = false;
      result.checks.database.error = String(err.message || err);
    }
  }

  // Base RPC check (JSON-RPC eth_chainId)
  if (process.env.BASE_RPC_URL) {
    result.checks.baseRpc.configured = true;
    try {
      const resp = await fetch(process.env.BASE_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      });
      const data = await resp.json();
      const chainId = data?.result;
      // expected Base chainId for mainnet: 0x2105 (decimal 8453)
      result.checks.baseRpc.ok = !!chainId;
      result.checks.baseRpc.chainId = chainId || null;
      result.checks.baseRpc.isBaseMainnet = chainId === '0x2105' || chainId === 8453 || chainId === '8453';
    } catch (err: any) {
      result.checks.baseRpc.ok = false;
      result.checks.baseRpc.error = String(err.message || err);
    }
  }

  // Facilitator check
  if (process.env.X402_FACILITATOR_URL) {
    result.checks.facilitator.configured = true;
    try {
      const url = process.env.X402_FACILITATOR_URL.replace(/\/$/, '');
      const resp = await fetch(url, { method: 'GET' });
      result.checks.facilitator.ok = resp.ok;
      result.checks.facilitator.status = resp.status;
    } catch (err: any) {
      result.checks.facilitator.ok = false;
      result.checks.facilitator.error = String(err.message || err);
    }
  }

  return NextResponse.json(result, { status: 200 });
}
