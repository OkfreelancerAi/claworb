# Security Policy

## Scope

ClawOrb is an early-stage project. The x402 v2 provider integration is a draft and has not been proven by a funded end-to-end payment. Do not send production funds based on repository claims alone.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue. Use GitHub's private vulnerability reporting feature for this repository if it is enabled. If it is unavailable, contact the maintainer privately through the contact method listed on the repository profile. Include affected paths, impact, and a minimal reproduction where safe.

## Payment-specific expectations

Please report issues involving:
- Payment acceptance without facilitator verification and successful settlement.
- Wrong chain, token contract, recipient, amount, or resource accepted.
- Replayed or reused payment authorizations.
- Settlement or earnings records created after a failed or unconfirmed payment.
- Secrets exposed in source, logs, client bundles, or API responses.

Do not include private keys, recovery phrases, entity secrets, or live API credentials in reports.

## Disclosure

Please allow time for investigation and remediation before public disclosure. This policy does not imply a security audit or production readiness.
