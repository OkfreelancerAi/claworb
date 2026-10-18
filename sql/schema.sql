-- ClawOrb settlements schema (Postgres / Supabase / Neon / Vercel Postgres)

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
CREATE INDEX IF NOT EXISTS idx_settlements_resource ON settlements(resource);
