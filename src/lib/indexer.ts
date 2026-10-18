/**
 * ClawOrb Settlement Indexer.
 * Paid routes require DATABASE_URL and durable Postgres storage; the memory
 * fallback remains available only for non-production/local analytics.
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
  asset?: string;
  payer?: string;
}

const memoryStore: SettlementEvent[] = [];

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function getPg() {
  const { default: pg } = await import("pg");
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  });
}

export async function ensureSchema() {
  if (!hasDatabase()) throw new Error("DATABASE_URL is required for durable settlement storage");

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
        asset TEXT,
        payer TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE settlements ADD COLUMN IF NOT EXISTS asset TEXT;
      ALTER TABLE settlements ADD COLUMN IF NOT EXISTS payer TEXT;
      CREATE INDEX IF NOT EXISTS idx_settlements_created ON settlements(created_at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_settlements_unique_payment
        ON settlements(chain, tx_hash);
    `);
  } finally {
    await pool.end();
  }
}

export async function recordSettlement(
  event: Omit<SettlementEvent, "id" | "timestamp">
): Promise<SettlementEvent> {
  if (!hasDatabase()) throw new Error("Durable settlement storage is not configured");

  await ensureSchema();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const full: SettlementEvent = { ...event, id, timestamp };
  const pool = await getPg();

  try {
    const inserted = await pool.query(
      `INSERT INTO settlements
        (id, tx_hash, amount, chain, resource, invite, skill_id, pay_to, asset, payer, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (chain, tx_hash) DO NOTHING
       RETURNING id, tx_hash as "txHash", amount::float8 as amount, chain,
                 resource, invite, skill_id as "skillId", pay_to as "payTo",
                 asset, payer, created_at as timestamp`,
      [
        id, event.txHash, event.amount, event.chain, event.resource,
        event.invite || null, event.skillId || null, event.payTo,
        event.asset || null, event.payer || null, timestamp,
      ]
    );

    if (inserted.rows[0]) {
      return { ...inserted.rows[0], timestamp: new Date(inserted.rows[0].timestamp).toISOString() };
    }

    // Idempotent replay: return the already-recorded event, never add revenue twice.
    const existing = await pool.query(
      `SELECT id, tx_hash as "txHash", amount::float8 as amount, chain,
              resource, invite, skill_id as "skillId", pay_to as "payTo",
              asset, payer, created_at as timestamp
       FROM settlements WHERE chain = $1 AND tx_hash = $2 LIMIT 1`,
      [event.chain, event.txHash]
    );
    if (!existing.rows[0]) throw new Error("Duplicate settlement could not be reconciled");
    return {
      ...existing.rows[0],
      timestamp: new Date(existing.rows[0].timestamp).toISOString(),
    };
  } finally {
    await pool.end();
  }
}

export async function listSettlements(limit = 50): Promise<SettlementEvent[]> {
  if (!hasDatabase()) return memoryStore.slice(0, limit);

  const pool = await getPg();
  try {
    const { rows } = await pool.query(
      `SELECT id, tx_hash as "txHash", amount::float8 as amount, chain,
              resource, invite, skill_id as "skillId", pay_to as "payTo",
              asset, payer, created_at as timestamp
       FROM settlements ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return rows.map((row: any) => ({
      ...row,
      timestamp: new Date(row.timestamp).toISOString(),
    }));
  } finally {
    await pool.end();
  }
}

export async function getStats() {
  if (!hasDatabase()) {
    const total = memoryStore.reduce((sum, event) => sum + event.amount, 0);
    return {
      count: memoryStore.length,
      totalUsdc: total,
      last: memoryStore[0] || null,
      backend: "memory",
      durable: false,
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
              asset, payer, created_at as timestamp
       FROM settlements ORDER BY created_at DESC LIMIT 1`
    );
    const last = lastRows.rows[0]
      ? { ...lastRows.rows[0], timestamp: new Date(lastRows.rows[0].timestamp).toISOString() }
      : null;

    return {
      count: rows[0].count,
      totalUsdc: rows[0].totalUsdc,
      last,
      backend: "postgres",
      durable: true,
    };
  } finally {
    await pool.end();
  }
}
