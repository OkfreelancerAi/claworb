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
| Base USDC payment requirement response | Scaffolded; protocol compatibility needs end-to-end validation |
| Facilitator verification + settlement | **Not implemented / not enabled** |
| Paid skill fulfillment | **Disabled until verification and settlement are implemented** |
| Settlement index | In-memory fallback; optional Postgres path exists, but durability and replay protection need further work |
| Live Base payment | **Not verified** |
| Production deployment | **Not verified** |

These are implementation notes, not marketing claims. A green build would not prove that real payment settlement works.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Useful routes:
- `/` — product overview and implementation status
- `/api/health` — service and settlement-index status
- `/api/earn` — payment-gated endpoint; currently fails closed when payment verification is unavailable

## Configuration and data

Review `src/lib/config.ts` before any deployment. Confirm recipient addresses, chain, token contract, and price units against the intended environment. Do not treat configured addresses or prices as evidence of ownership, a live balance, or a successful payment.

If `DATABASE_URL` is configured, the indexer uses Postgres; otherwise it uses an in-memory store that resets when the process restarts. The current indexer is not yet a production-grade, replay-resistant settlement ledger.

## Release gates before accepting money

1. Select and consistently implement one x402 protocol version and its canonical schemas/headers.
2. Validate the complete payment payload with a compatible facilitator `/verify` call.
3. Call `/settle` using the verified requirements and payload; require a confirmed transaction hash and successful settlement response.
4. Validate network, token, recipient, amount, and resource binding server-side.
5. Add durable idempotency/replay protection and adversarial tests.
6. Record earnings only after successful settlement; reconcile records against on-chain data.
7. Run CI, complete a funded testnet payment, inspect the transaction on an explorer, and document evidence before claiming readiness.

Never add private keys, entity secrets, API tokens, or production credentials to the repository.

## Contributing

Please include reproduction steps and expected behavior for bug reports. Payment changes must include protocol-level tests for missing, malformed, wrong-network, wrong-token, wrong-recipient, underpaid, reused, rejected, and unsettled payments.

Built by [@okfreelancer](https://x.com/okfreelancer).
