# ClawOrb x402 v2 provider setup

## Status

The feature branch migrates paid routes to the official TypeScript x402 v2 SDK, pinned to 2.28.0. It is not production-ready until dependencies are installed, a production facilitator is configured, durable storage and a trusted Base RPC are configured, and build/adversarial tests pass.

No transaction was sent by this code change. It adds server-side verification and settlement handling; it does not prove that a live payment has occurred.

## Pinned SDK packages

- @x402/core@2.28.0
- @x402/evm@2.28.0
- @x402/next@2.28.0

The SDK handles canonical v2 challenge construction, PAYMENT-SIGNATURE, payment payload parsing, facilitator verification, and settlement through the Next.js withX402 adapter. Base mainnet is eip155:8453. The configured asset is Base USDC 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913.

## Required environment variables

- X402_FACILITATOR_URL — HTTPS URL for a production facilitator that confirms support for x402 v2, exact, and eip155:8453. The public x402.org facilitator is intentionally rejected in production.
- BASE_RPC_URL — trusted Base mainnet RPC endpoint. The code verifies the receipt's chain ID and exact USDC Transfer event.
- DATABASE_URL — durable Postgres connection. Paid fulfillment is disabled without it.
- DATABASE_SSL — optional; set to false only when the database environment explicitly requires no TLS.

Keep credentials in the hosting provider's secret manager. Never commit secrets.

## Payment and earnings safety

1. The SDK builds canonical v2 requirements for the actual request URL, exact scheme, eip155:8453, the configured recipient, price, and a 60-second maximum timeout.
2. The SDK handles the v2 payment header and facilitator lifecycle.
3. The wrapper requires a successful PAYMENT-RESPONSE settlement receipt with a real transaction hash and the expected network.
4. The wrapper queries Base mainnet and requires a successful transaction receipt containing a Base USDC Transfer log with the configured recipient, exact expected atomic amount, and payer match when the facilitator supplies a payer.
5. Only then is the settlement recorded with the asset, payer, recipient, network, amount, and resource.
6. Postgres enforces uniqueness by (chain, tx_hash); retries return the already-recorded settlement instead of adding revenue twice.

A facilitator receipt without a matching on-chain transfer is rejected. If the chain settlement succeeds but the database write fails, the API returns a reconciliation error and transaction hash; do not blindly pay again.

## Agentic paid capabilities

All listed prices are configured offers, not verified sales or income.

| Endpoint | Price | What it does |
|---|---:|---|
| GET /api/agent/services | Free | Returns the service catalog and current configured prices |
| POST /api/agent/evidence-check | $0.01 USDC | Checks evidence URL shape, domain diversity, and missing context; does not establish factual truth |
| POST /api/agent/opportunity-score | $0.02 USDC | Scores input completeness and computes arithmetic from caller-supplied estimates; does not predict returns |
| POST /api/agent/task-spec | $0.01 USDC | Turns a goal into a structured task with acceptance and failure criteria |
| GET/POST /api/earn | $0.05 USDC | Reports ClawOrb capability execution metadata |

The first three paid tools are deliberately bounded. They do not fabricate web research, claim on-chain analysis they did not perform, or guarantee earnings. The next sensible extensions are source-fetching research with citations, live wallet risk analysis, agent tool discovery, and opportunity alerts—but only after adding source adapters, provenance, rate limits, and tests.

## Required release gates

- [ ] Install pinned dependencies and commit the generated lockfile.
- [ ] Confirm the selected facilitator's live /supported response lists v2, exact, and eip155:8453.
- [ ] Run typecheck, build, and endpoint tests.
- [ ] Test absent/malformed payment headers, wrong chain, wrong asset, wrong recipient, underpayment, expired authorization, replay, facilitator timeout, settlement pending, failed receipt, RPC mismatch, and database failure.
- [ ] Verify that 4xx handler responses are not settled and that retries do not double-count.
- [ ] Reconcile each recorded settlement against Base explorer/RPC evidence.
- [ ] Complete an explicitly approved, low-value live payment only after the above gates pass.

Until all gates pass, do not claim production readiness or earnings.