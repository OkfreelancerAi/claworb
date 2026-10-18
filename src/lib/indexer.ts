/**
 * ClawOrb Settlement Indexer
 * Uses real Postgres when DATABASE_URL is set (Supabase, Neon, Vercel Postgres, etc.).
 * Falls back to in-memory store for local/dev.
 */

export interface SettlementEvent {
  id: string;
  txHash: string;
  amount: number;
  chain: string;
  resource: string;
  invite?: string;
  skillId?: string;
  timestamp: string;
  payTo: string;
}

const memoryStore: SettlementEvent[] = [];

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function getPg() {
  // Dynamic import so the package is only required when DATABASE_URL is present
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  });
  return pool;
}

export async function ensureSchema() {
  if (!hasDatabase()) return;

  const pool = await getPg();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settlements (
        id UUID PRIMARY KEY,
        tx_hash TEXT NOT NULL,
        amount NUMERIC(18,6) NOT NULL,
        chain TEXT NOT NULL,
        resource TEXT NOT NULL,
        invite TEXT,
        skill_id TEXT,
        pay_to TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_settlements_created ON settlements(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_settlements_tx ON settlements(tx_hash);
    `);
  } finally {
    await pool.end();
  }
}

export async function recordSettlement(
  event: Omit<SettlementEvent, "id" | "timestamp">
): Promise<SettlementEvent> {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const full: SettlementEvent = { ...event, id, timestamp };

  if (!hasDatabase()) {
    memoryStore.unshift(full);
    if (memoryStore.length > 500) memoryStore.length = 500;
    return full;
  }

  const pool = await getPg();
  try {
    await pool.query(
      `INSERT INTO settlements
        (id, tx_hash, amount, chain, resource, invite, skill_id, pay_to, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        id,
        event.txHash,
        event.amount,
        event.chain,
        event.resource,
        event.invite || null,
        event.skillId || null,
        event.payTo,
        timestamp,
      ]
    );
    return full;
  } finally {
    await pool.end();
  }
}

export async function listSettlements(limit = 50): Promise<SettlementEvent[]> {
  if (!hasDatabase()) {
    return memoryStore.slice(0, limit);
  }

  const pool = await getPg();
  try {
    const { rows } = await pool.query(
      `SELECT id, tx_hash as "txHash", amount::float8 as amount, chain,
              resource, invite, skill_id as "skillId", pay_to as "payTo",
              created_at as timestamp
       FROM settlements
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows.map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp).toISOString(),
    }));
  } finally {
    await pool.end();
  }
}

export async function getStats() {
  if (!hasDatabase()) {
    const total = memoryStore.reduce((sum, e) => sum + e.amount, 0);
    return {
      count: memoryStore.length,
      totalUsdc: total,
      last: memoryStore[0] || null,
      backend: "memory",
    };
  }

  const pool = await getPg();
  try {
    const { rows } = await pool.query(`
      SELECT COUNT(*)::int as count,
             COALESCE(SUM(amount),0)::float8 as "totalUsdc"
      FROM settlements
    `);
    const lastRows = await pool.query(
      `SELECT id, tx_hash as "txHash", amount::float8 as amount, chain,
              resource, invite, skill_id as "skillId", pay_to as "payTo",
              created_at as timestamp
       FROM settlements ORDER BY created_at DESC LIMIT 1`
    );
    const last = lastRows.rows[0]
      ? {
          ...lastRows.rows[0],
          timestamp: new Date(lastRows.rows[0].timestamp).toISOString(),
        }
      : null;

    return {
      count: rows[0].count,
      totalUsdc: rows[0].totalUsdc,
      last,
      backend: "postgres",
    };
  } finally {
    await pool.end();
  }
}
