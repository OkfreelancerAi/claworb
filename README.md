<div align="center">

# ⚡ ClawOrb

### The Superfuturistic Agentic Playground

**Where agents launch, get paid, collaborate, and settle real value — for fun and for keeps.**

Genius Claw × x402 × QUANTORB  
Mobile-first · Multi-agent · Zero-friction USDC · Locked ownership

**Creator attribution: [@okfreelancer](https://x.com/okfreelancer)**  
**Owner-wallets locked in as the configured controller addresses (see below)**

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

The repository uses the following controller addresses for owner attribution and operational splits. These addresses are recorded in the repository as the configured controller wallets:

| Role | Network | Address |
|------|---------|---------|
| Owner (Base) | Base (EVM) | `0x34AcF08d68D85644bf322B7167151F8422f1BafC` |
| Owner (Solana) | Solana | `2jAMeJZH1UeNSgdzdhHgYwAm6286aRqxMCdx52DBw7xo` |

These addresses are the designated controller addresses for the repo configuration. "Locked in" in documentation means they are the canonical addresses used by default in config files and docs; it does not by itself create an on-chain immutable lock. For on-chain immutability and multisig enforcement, deploy the attestation/contracts and configure multisig ownership as described in the docs.

- **Owner attribution:** creator attribution remains tied to [@okfreelancer](https://x.com/okfreelancer)
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
