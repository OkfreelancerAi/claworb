<div align="center">

# ⚡ ClawOrb

### Evidence-first intelligence for autonomous agents

**Research, verify claims, and expose the evidence behind every answer.**

Source-backed briefs · Claim/date/figure checks · x402-ready service boundary · Base USDC target

[Architecture](docs/architecture.md) · [Security](SECURITY.md) · [Open issues](https://github.com/OkfreelancerAi/claworb/issues)

</div>

---

## Why ClawOrb

Agents can generate answers quickly. Trustworthy agents need to show *why* an answer should be trusted. ClawOrb is being shaped around a practical service: turn a research question into a structured brief with source links, check important claims against those sources, and clearly label what is verified, uncertain, or missing.

### Product principles

- **Evidence before confidence.** Important factual claims should link to sources and distinguish source facts from inference.
- **No invented proof.** No fabricated citations, transaction hashes, settlement records, earnings, or adoption metrics.
- **Fail closed on payments.** A payment header is not proof of payment. Paid fulfillment remains disabled until the chosen x402 protocol flow is fully verified and settled.
- **Observable by design.** Report provider readiness and storage mode explicitly; never present an in-memory demo ledger as durable revenue accounting.
- **Small, testable releases.** Typecheck and production-build checks run in GitHub Actions.

## Current implementation status

| Area | Status |
|---|---|
| Next.js app shell | Implemented |
| TypeScript check and production build workflow | Configured; latest successful run not yet verified |
| x402 v2 SDK integration | Present in the draft feature branch; not yet validated end-to-end |
| Facilitator verification + settlement | Requires configuration and end-to-end validation |
| On-chain receipt verification and settlement indexing | Implemented in draft code; not yet independently verified |
| Paid agent capabilities | Bounded input-quality / task-structuring helpers; not a factual research engine |
| Live Base payment | **Not verified** |
| Production deployment | **Not verified** |

These are implementation notes, not marketing claims. A green build would not prove that real payment settlement works.

## Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

- `/` — product overview and implementation status
- `/api/health` — service and settlement-index status
- `/api/earn` — paid capability endpoint; requires correctly configured x402 v2 facilitator and storage

## Configuration and data

Review `src/lib/config.ts` before deployment. Confirm recipient addresses, chain, token contract, and price units against the intended environment. Do not treat configured addresses or prices as evidence of ownership, a live balance, or a successful payment.

The paid provider requires `X402_PAY_TO`, `X402_FACILITATOR_URL`, `BASE_RPC_URL`, and `DATABASE_URL`. `X402_PAY_TO` must be the recipient address you have independently verified. Paid routes fail closed if any required value is absent or invalid. Configure secrets in the deployment environment, never in Git. A configured environment is not proof of a successful live payment. See `.env.example` for variable names.

## What the paid capabilities do—and do not do

The current draft exposes bounded services such as evidence-pack completeness checks, opportunity-input triage, and structured task specifications. These do not constitute independent factual verification, financial advice, execution of a user task, or a promise of returns. Outputs should state their limits.

## Release gates before accepting money

1. Install dependencies and commit a reproducible lockfile.
2. Typecheck, build, and add/run endpoint tests.
3. Confirm the selected facilitator's live supported networks and schemes match x402 v2 exact on Base mainnet.
4. Test malformed/missing payloads, wrong network/asset/recipient/amount, expired authorization, replay, facilitator timeout, pending/failed settlement, RPC mismatch, and database write failure.
5. Complete a funded testnet payment and inspect the transaction on an explorer.
6. Confirm no rejected or unconfirmed payment creates a fulfillment or earnings record.
7. Reconcile persisted settlement records against on-chain transfers before describing revenue as verified.

Never send a live transaction without explicit authorization for that specific transaction.

## Contributing

Please include reproduction steps and expected behavior for bug reports. Payment changes must include protocol-level and adversarial tests.

Built by [@okfreelancer](https://x.com/okfreelancer).
