# ClawOrb Architecture

## Product direction

ClawOrb is an evidence-first research and claim-verification service for autonomous agents. The differentiator is not simply generating a confident answer: it is linking claims to sources, exposing uncertainty, checking dates and figures, and refusing to invent evidence.

## Current boundaries

- **Web app:** Next.js App Router, mobile-oriented landing page.
- **Paid capabilities:** the feature branch uses the x402 TypeScript v2 SDK and wraps service handlers with a paid-route adapter. The integration remains unvalidated end-to-end until dependency installation, tests, a compatible facilitator, and an on-chain payment are verified.
- **Provider configuration:** Base mainnet namespace `eip155:8453`; configured USDC contract and recipient must be independently confirmed for the deployment environment.
- **Settlement checks:** draft code inspects a facilitator settlement response and Base transaction receipt before recording a settlement. This is not a substitute for adversarial tests and independent verification.
- **Settlement index:** optional Postgres implementation with an in-memory fallback. The in-memory mode is not durable revenue accounting.
- **Paid agent capabilities:** current examples are bounded input-quality checks and task structuring, not an autonomous factual research engine or a financial recommendation service.

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
2. Server returns a canonical HTTP 402 challenge using the selected x402 v2 SDK.
3. Client supplies the matching payment payload in the protocol's canonical header.
4. Server validates the payment against the exact route requirements, network, token, amount, and recipient.
5. Server verifies through a compatible facilitator and follows the SDK's settlement flow.
6. Server requires successful settlement and a valid transaction hash.
7. Where configured, the server independently inspects the Base receipt for the expected USDC transfer and terms.
8. Only then does the service fulfill the request and persist an idempotent settlement record.
9. A reconciliation process checks stored records against on-chain transactions.

**This flow is draft code and has not yet been proven by a funded end-to-end test.** Do not describe the provider as production-ready or claim revenue until all gates pass.

## Security requirements

- Fail closed if facilitator, RPC, or durable database configuration is absent or invalid.
- Reject wrong network, token, recipient, amount, resource, malformed payloads, expired/reused authorizations, and failed settlement.
- Use durable idempotency and reject a transaction hash reused with different payment terms/resources.
- Keep secrets server-side and out of Git history, logs, client bundles, and API responses.
- Validate all public endpoint inputs and use bounded timeouts.
- Keep demo/in-memory activity separate from confirmed on-chain revenue.
- Reconcile settlement records against chain data and monitor failures.

## Quality gates

Before a release can be described as payment-capable:

- TypeScript and production build pass in CI.
- Endpoint tests cover valid and adversarial payment cases, settlement failures, and replay handling.
- A funded testnet payment succeeds end-to-end and the transaction is independently inspectable.
- Rejected-payment tests prove no fulfillment and no earnings record is created.
- Persistent storage, monitoring, rate limits, operational recovery, and reconciliation are configured.
- Deployment and runtime checks pass; the deployed revision is identified.

A passing build is necessary, not sufficient, evidence of payment correctness.
