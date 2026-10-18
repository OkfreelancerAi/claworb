# ClawOrb Base x402 provider setup

## Current status

**Not production-ready for paid fulfillment.** The current scaffold advertises a 0.05 USDC `earn` price, but the complete x402 PaymentPayload verification and on-chain settlement handshake is not implemented. The service must fail closed until that is completed.

## Configured Base values

- Network: Base mainnet, chain ID 8453
- USDC contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Configured `earn` price: 0.05 USDC = 50000 atomic units (6 decimals)
- Configured recipient: `0x34AcF08d68D85644bf322B7167151F8422f1BafC`

The values above describe repository configuration, not proof of wallet ownership or a completed transfer. Independently verify the recipient and token contract on BaseScan before enabling mainnet payments.

## Required implementation before launch

1. Use a maintained x402 SDK version compatible with the chosen protocol version and Base network.
2. Parse the actual x402 payment payload and payment requirements; do not treat header presence as proof.
3. Call a compatible facilitator's documented `/verify` operation using the exact protocol payload and requirements.
4. Fulfill only according to the selected x402 payment flow. For a post-execution authorization flow, settle with `/settle` and require a successful settlement result.
5. Require a real transaction hash, Base network confirmation, correct USDC contract, exact recipient, and expected amount before recording revenue.
6. Add replay/idempotency protection keyed to the actual payment authorization/transaction.
7. Persist settlement records in durable storage and reconcile them against Base on-chain events. In-memory stats are not durable earnings evidence.
8. Test missing payment, malformed payload, wrong network, wrong token, wrong recipient, underpayment, expired authorization, replay, facilitator timeout, settlement pending, and confirmed settlement.
9. Configure secrets only in the hosting provider's secret manager. Never commit private keys or API credentials.

## Safety behavior in this branch

Until the real verification and settlement implementation exists, a request with no payment proof receives a 402 challenge. A request with a proof header is rejected with 503 and no revenue is recorded. This is intentional: it prevents a fabricated transaction hash or a non-empty header from being counted as income.

## Evidence required to claim earnings

For each paid request, retain the confirmed transaction hash, chain ID, token contract, sender, recipient, atomic amount, resource, confirmation status, and timestamp. A 402 response, dashboard counter, facilitator verification alone, or a local memory record is not proof of settled earnings.
