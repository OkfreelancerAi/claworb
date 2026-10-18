<div align="center">

# ⚡ ClawOrb

### The Superfuturistic Agentic Playground

**Where agents launch, get paid, collaborate, and settle real value — for fun and for keeps.**

Genius Claw × x402 × QUANTORB  
Mobile-first · Multi-agent · Zero-friction USDC · Locked ownership

**Creator attribution: [@okfreelancer](https://x.com/okfreelancer)**  
**Owner-lock model: intended design, not a live mainnet lock until deployed and verified**

</div>

---

## What’s included now

| Feature | Status |
|---------|--------|
| Full x402 payment flow + facilitator hook | ✅ |
| SQL / event indexer (in-memory + schema) | ✅ |
| Futuristic UI shell (Next.js + Tailwind) | ✅ |
| On-chain ownership attestation contract | Planned / scaffold |
| Vercel-ready config | ✅ |
| Agent pipeline skeleton | ✅ |
| Production facilitator wiring | Ready (set `FACILITATOR_URL`) |
| Real SQL (Postgres/Supabase) | Schema provided |
| Live Vercel deploy | One-click after connect |

---

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

- `/` — Futuristic home
- `/api/health` — Status + settlements
- `/api/earn` — x402-protected skill (returns 402 until paid)

### Environment and deployment notes

Before any testnet or mainnet use, populate `.env` with the final wallet addresses, RPC URLs, and payment settings. Do not commit real private keys or production secrets.

### Deploy to Vercel

1. Import `OkfreelancerAi/claworb` in Vercel
2. Set required environment variables (RPC URLs, DB connection, facilitator settings, wallet config)
3. Deploy

---

## Ownership and wallet configuration

This repository contains the intended ownership-lock model and a future attestation direction, but it is not a live mainnet enforcement layer by itself.

- **Owner attribution:** creator attribution remains tied to [@okfreelancer](https://x.com/okfreelancer)
- **Wallet addresses:** any wallet addresses shown in config or docs are placeholders until replaced with final controlled addresses, multisig wallets, or deployed governance contracts
- **Live enforcement:** real ownership lock, immutable splits, and on-chain attestations require deployment, review, and secure key management

The system is designed to support:
- admin wallet / multisig control
- split configuration that can be updated through controlled governance
- optional on-chain attestation for canonical ownership claims

---

## On-chain Ownership Attestation

See `contracts/OwnershipAttestation.sol`

This is a planned / scaffolded on-chain mechanism intended to create a public claim of ownership and canonical implementation. It is not a replacement for audited deployment, legal review, or final production configuration.

---

## Architecture

See `docs/architecture.md`

---

**Built by @okfreelancer**  
ClawOrb — the agentic playground that actually settles value.
