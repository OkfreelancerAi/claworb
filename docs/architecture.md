# ClawOrb Architecture

## Product direction

ClawOrb is an evidence-first research and claim-verification service for autonomous agents. The differentiator is not simply generating a confident answer: it is linking claims to sources, exposing uncertainty, checking dates and figures, and refusing to invent evidence.

## Current boundaries

- **Web app:** Next.js App Router, mobile-oriented landing page.
- **Paid endpoint:** `/api/earn` returns a payment requirement when no proof is supplied. If a payment header is present, the current provider guard fails closed because complete protocol verification and settlement are not implemented.
- **Health endpoint:** `/api/health` reports app and indexer status.
- **Settlement index:** optional Postgres implementation with an in-memory fallback. The current store does not yet provide sufficient durable idempotency/replay protection for production revenue accounting.
- **Payments:** Base USDC is the current target configuration. No live payment, confirmed settlement, or production readiness is claimed.

## Intended research result contract

A future research response should make evidence inspectable. A recommended result shape:

- `question`: original user question
- `summary`: concise answer
- `claims[]`: claim text, status (`supported`, `contradicted`, `uncertain`, `unverified`), source references, and explanation
- `sources[]`: canonical URL, title, publisher, publication date when available, retrieval time, and relevant excerpt
- `limitations[]`: missing sources, conflicts, stale data, and assumptions

A source link alone is not proof that every statement is supported. Claims must be checked against the source content, and unknowns must remain unknown.

## Target x402 request flow

1. Client requests a paid resource.
2. Server returns a canonical HTTP 402 challenge for one explicitly selected x402 version.
3. Client supplies the matching payment payload in the protocol's canonical header.
4. Server validates schema and binds the payment to the requested resource, network, token, amount, and recipient.
5. Server calls the compatible facilitator `/verify` with the exact payload and requirements.
6. Server calls `/settle` following the selected version's protocol flow.
7. Server requires successful settlement plus a valid transaction hash and confirms the expected chain/token/recipient as required by the provider contract.
8. Only then does the service fulfill the request and persist an idempotent settlement record.
9. A reconciliation process checks stored records against on-chain transactions.

**The current code does not complete this flow.** Do not enable paid fulfillment until it does. Do not mix v1 challenge fields with v2 headers or payload schemas.

## Security requirements

- Fail closed if facilitator configuration is absent, malformed, or unavailable.
- Never infer payment from the presence of a header.
- Reject wrong network, token, recipient, amount, resource, malformed payloads, expired/reused authorizations, and failed settlement.
- Use a durable uniqueness constraint/idempotency key for settlement records and protect against concurrent replay.
- Keep secrets server-side and out of Git history, logs, client bundles, and API responses.
- Validate all public endpoint inputs and use bounded timeouts.
- Keep demo/in-memory activity separate from confirmed on-chain revenue.
- Minimize health endpoint disclosures; never expose secrets or unnecessary wallet metadata.

## Quality gates

Before a release can be described as payment-capable:

- TypeScript and production build pass in CI.
- Unit and adversarial tests cover payment challenge parsing, verification, settlement, and replay handling.
- A funded testnet payment succeeds end-to-end and the transaction is independently inspectable.
- Rejected-payment tests prove no fulfillment and no earnings record is created.
- Persistent storage, monitoring, rate limits, operational recovery, and reconciliation are configured.
- Deployment and runtime checks pass; the deployed revision is identified.

A passing build is necessary, not sufficient, evidence of payment correctness.
