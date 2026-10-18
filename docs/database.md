# ClawOrb Database Setup

## Supported providers
- Supabase
- Neon
- Vercel Postgres
- Any standard Postgres

## Setup

1. Create a Postgres database.
2. Copy the connection string into `DATABASE_URL`.
3. (Optional) run the schema manually:

```bash
psql $DATABASE_URL -f sql/schema.sql
```

The app will also auto-create the table on first write via `ensureSchema()` if you call it at startup.

## Behavior

| `DATABASE_URL` | Backend used |
|----------------|--------------|
| Set | Real Postgres |
| Not set | In-memory (local/dev) |

## Table: `settlements`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| tx_hash | TEXT | Payment / transaction proof |
| amount | NUMERIC(18,6) | USDC amount |
| chain | TEXT | base / solana |
| resource | TEXT | skill or endpoint name |
| invite | TEXT | optional invite code |
| skill_id | TEXT | optional skill id |
| pay_to | TEXT | destination wallet |
| created_at | TIMESTAMPTZ | auto |
