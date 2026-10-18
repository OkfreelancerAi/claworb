# ClawOrb

**Genius Claw × x402 × QUANTORB**

Mobile-first multi-agent revenue system with zero-friction x402 micropayments, locked ownership, and trackable real USDC settlements on Base & Solana.

**Ownership permanently locked to [@okfreelancer](https://x.com/okfreelancer) / [OkfreelancerAi](https://github.com/OkfreelancerAi)**

---

## Product Brief

ClawOrb merges three proven directions:

| Source | Contribution |
|--------|--------------|
| **Genius Claw** | Mobile dApp experience, launch flows, ownership lock on Base, Circle-style USDC payouts, research pipeline |
| **x402 Micropay** | HTTP 402 USDC payments (no accounts, no API keys), dual-chain (Base + Solana) |
| **QUANTORB** | 6-core agent pipeline + sub-agents, public skill board, invite links, programmable 20/30/50 earnings splits |

### Core Value Proposition

Agents and creators can:
1. Launch or discover opportunities (Claw-style)
2. Expose payable skills or research via x402
3. Let a multi-agent system evaluate, decide, and route value
4. Settle real USDC to locked, trackable wallets with transparent splits

Everything is designed so value movement is **observable, attributable, and locked to the owner**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  Mobile-first · Launch UI · Skill Board · Dashboard     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                 Payment Layer (x402)                     │
│  HTTP 402 · Base USDC · Solana USDC · Facilitator ready │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Agent Pipeline (QUANTORB-style)             │
│  SCOUT → CARTOGRAPHER → JUDGE → QUANT → GUARD → EXECUTOR│
│  + high-value sub-agents · Skill Board · Invite links   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│           Settlement & Tracking Layer                    │
│  Locked wallets · Programmable splits · SQL / ledger    │
│  On-chain event indexing · Audit trail                  │
└─────────────────────────────────────────────────────────┘
```

### Locked Wallets (Owner-Controlled)

| Role | Network | Address (placeholder – replace with final) | Share |
|------|---------|---------------------------------------------|-------|
| Owner | Base | `0x34AcF08d68D85644bf322B7167151F8422f1BafC` | 20–50% |
| Owner / Ops | Solana | `CG9DVW1yaBd6BeMjcJAzyTgCaY2nvp7oynW711BQUZoz` | 20–50% |
| Treasury | Solana | `2jAMeJZH1UeNSgdzdhHgYwAm6286aRqxMCdx52DBw7xo` | Remaining |

All splits are configurable but ownership of the system remains locked to the above controller addresses.

---

## Trackable Real Transactions

- Every paid x402 call produces a verifiable payment proof
- Settlements land in the locked wallets above
- Optional SQL / event indexer stores:
  - payment hash / signature
  - amount, chain, timestamp
  - skill or endpoint called
  - originating agent / invite link
- Dashboard surfaces live USDC balances and historical settlements (same pattern as Crab Claw Racers)

No simulated balances. Only real, on-chain USDC movements.

---

## On-chain Ownership Lock & “Patent” Direction

- **Ownership lock**: Critical configuration (wallet list, split ratios, admin keys) is intended to be immutable or multi-sig controlled after deployment.
- **Attribution**: All public skill boards and invite links carry permanent creator attribution to @okfreelancer.
- **Future on-chain claim**: Architecture is prepared for an on-chain registry or attestation (e.g. via a simple ownership NFT or attestation contract on Base) that records the canonical ClawOrb implementation and owner. This is the practical equivalent of an on-chain patent / prior-art claim for the combined system.

---

## Tech Stack

- **Frontend / API**: Next.js 14+ (App Router), TypeScript
- **Payments**: x402 (Base + Solana USDC)
- **Chains**: Base, Solana
- **Settlement tracking**: On-chain events + optional SQL (Postgres / Supabase or similar)
- **Deploy**: Vercel (frontend + API routes)
- **Agent layer**: Modular TypeScript agents (QUANTORB-inspired pipeline)

---

## Project Structure (Scaffold)

```
claworb/
├── README.md
├── package.json
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/
│   │   │   ├── health/
│   │   │   ├── price/
│   │   │   └── earn/         # x402 protected example
│   │   └── page.tsx
│   ├── lib/
│   │   ├── config.ts         # wallets, prices, splits
│   │   ├── x402.ts           # 402 challenge + verification helpers
│   │   └── agents/           # SCOUT → EXECUTOR skeleton
│   └── components/
├── docs/
│   └── architecture.md
└── .env.example
```

---

## Quick Start (after clone)

```bash
npm install
npm run dev
```

Deploy to Vercel with one click. Set final wallet addresses in `src/lib/config.ts` before mainnet use.

---

## Status

- [x] Repository scaffolded
- [x] Product brief & architecture documented
- [x] Owner-lock and tracking model defined
- [ ] x402 payment skeleton implementation
- [ ] Agent pipeline skeleton
- [ ] SQL / event indexer
- [ ] Vercel production deploy
- [ ] On-chain ownership attestation (optional next phase)

---

**Built by @okfreelancer**  
ClawOrb — agents that can launch, get paid, and settle value under locked ownership.
