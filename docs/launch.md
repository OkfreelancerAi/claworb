# Production launch checklist for ClawOrb

This file documents the minimal operational steps to deploy ClawOrb in a production environment.

1. Environment variables
   - X402_PAY_TO: a verified EVM address that will receive USDC payments
   - X402_FACILITATOR_URL: the x402 facilitator endpoint (HTTPS)
   - BASE_RPC_URL: a Base mainnet RPC endpoint (HTTPS)
   - DATABASE_URL: Postgres or Supabase connection string
   - DATABASE_SSL: optional, set to "false" if your DB does not require TLS

2. Verify configuration locally
   - Copy .env.example to .env.local and fill values
   - Run: npm ci && npm run check:launch
   - Expected: all checks pass

3. Vercel deployment
   - Import the repo in Vercel
   - Set the above environment variables in the Project > Settings > Environment Variables
   - Deploy. The app exposes /api/launch for runtime readiness and /api/health for basic stats

4. Post-deploy validation
   - Visit /api/launch to confirm services are reachable
   - Use a small test payment through the x402 facilitator to the configured recipient and verify the settlement appears in /api/health and in your Postgres `settlements` table

5. Notes
   - The code verifies on-chain USDC Transfer events on Base before recording settlements. Ensure your BASE_RPC_URL supports fetching transaction receipts and logs.
   - Do NOT commit private keys or secrets into the repo.

