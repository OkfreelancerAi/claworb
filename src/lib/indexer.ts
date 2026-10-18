/**
 * ClawOrb SQL / Event Indexer (stub)
 * Records every verified payment for the dashboard.
 * Swap the in-memory store for Postgres / Supabase / Neon in production.
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

// In-memory store for scaffold / demo. Replace with real SQL.
const events: SettlementEvent[] = [];

export async function recordSettlement(
  event: Omit<SettlementEvent, "id" | "timestamp">
): Promise<SettlementEvent> {
  const full: SettlementEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  events.unshift(full);
  // Keep last 500 in memory for demo
  if (events.length > 500) events.length = 500;
  return full;
}

export async function listSettlements(limit = 50): Promise<SettlementEvent[]> {
  return events.slice(0, limit);
}

export async function getStats() {
  const total = events.reduce((sum, e) => sum + e.amount, 0);
  return {
    count: events.length,
    totalUsdc: total,
    last: events[0] || null,
  };
}

/**
 * Example SQL schema for production (Postgres / Supabase):
 *
 * CREATE TABLE settlements (
 *   id UUID PRIMARY KEY,
 *   tx_hash TEXT NOT NULL,
 *   amount NUMERIC(18,6) NOT NULL,
 *   chain TEXT NOT NULL,
 *   resource TEXT NOT NULL,
 *   invite TEXT,
 *   skill_id TEXT,
 *   pay_to TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * CREATE INDEX idx_settlements_created ON settlements(created_at DESC);
 * CREATE INDEX idx_settlements_tx ON settlements(tx_hash);
 */
