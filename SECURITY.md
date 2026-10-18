# Security Policy

## Scope

ClawOrb is an early-stage project. The payment provider currently fails closed because the complete x402 verification and settlement flow is not implemented. Do not send production funds to an endpoint based on repository claims alone.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Use GitHub's private vulnerability reporting feature for this repository if it is enabled. If it is unavailable, contact the maintainer privately through the contact method listed on the repository profile. Include affected paths, impact, and a minimal reproduction where safe.

## Payment-specific expectations

Please report issues involving:
- Payment acceptance without facilitator verification and successful settlement.
- Wrong chain, token contract, recipient, amount, resource, or protocol version accepted.
- Replayed or reused payment authorizations.
- Settlement or earnings records created after a failed or unconfirmed payment.
- Secrets exposed in source, logs, client bundles, or API responses.

Do not include private keys, recovery phrases, entity secrets, or live API credentials in reports.

## Disclosure

Please allow time for investigation and remediation before public disclosure. No security audit or production readiness is implied by this policy.
