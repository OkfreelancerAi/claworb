# ClawOrb Architecture

## 1. Goals

- Combine Genius Claw (mobile launch + ownership lock + Circle USDC), x402 (frictionless payments), and QUANTORB (multi-agent pipeline + skill board).
- Make every value movement trackable and attributable to locked owner wallets.
- Keep the system deployable on Vercel with clear separation of concerns.

## 2. Layers

### 2.1 Presentation
- Next.js App Router, mobile-first.
- Launch interface, public skill board, invite links, live earnings dashboard.

### 2.2 Payment (x402)
- Any valuable endpoint can return HTTP 402 with dual-chain (Base + Solana) USDC requirements.
- Client pays → proof in header → server verifies → data returned.
- Funds settle directly to configured creator wallets.

### 2.3 Agent Pipeline
Inspired by QUANTORB:

1. **SCOUT** – discovery of launches / opportunities / data
2. **CARTOGRAPHER** – relationship and graph mapping
3. **JUDGE** – quality / edge evaluation
4. **QUANT** – pricing, cost, and execution parameters
5. **GUARD** – risk, concentration, safety checks
6. **EXECUTOR** – final action or model of action

Sub-agents can be attached for specialized skills (payments, treasury, research, etc.).

### 2.4 Settlement & Tracking
- Locked wallet list + split ratios in config (and optionally on-chain).
- Payment proofs and on-chain transfer events are indexed.
- Optional SQL store for fast dashboard queries (payment hash, amount, chain, skill, timestamp, invite source).
- Dashboard shows only real balances and history.

### 2.5 Ownership Lock
- Critical parameters (wallets, splits, admin) are intended to be immutable or multi-sig after launch.
- Public attribution permanently references @okfreelancer.
- Future: on-chain attestation / ownership NFT on Base as a permanent claim.

## 3. Data Flow (Paid Skill Call)

1. Client / agent requests a skill or research endpoint.
2. Server responds 402 + payment requirements.
3. Client signs and submits payment proof.
4. Server verifies proof (facilitator or local).
5. Business logic (agent pipeline or direct response) executes.
6. Result returned; payment already settled to locked wallets.
7. Event written to tracker / SQL for the dashboard.

## 4. Security & Trust Notes

- Never expose private keys in the frontend or public repo.
- Use environment variables or secure secret management for any signing authority.
- Prefer facilitator services for production x402 settlement verification.
- Treat the current scaffold as research + production-ready structure; mainnet capital movement requires audited programs and final wallet confirmation.

## 5. Next Implementation Steps

1. Implement `src/lib/x402.ts` and protected API routes.
2. Add minimal agent interfaces under `src/lib/agents/`.
3. Wire a simple SQL or file-based event log.
4. Deploy to Vercel and point real wallets.
5. (Optional) Deploy a minimal ownership attestation contract on Base.
