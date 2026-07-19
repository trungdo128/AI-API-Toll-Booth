# AI API Toll Booth

AI API Toll Booth is a Stellar Testnet API marketplace where providers can sell protected API access and clients can pay per request or from a funded session.

## Status

Implementation has started on the `development` branch. Mainnet deployment, Mainnet claims, user evidence, external audits, and demo video are intentionally not claimed.

## Workspace

- `apps/web` — marketplace and provider dashboard
- `apps/api` — payment gateway and protected API service
- `apps/agent-client` — HTTP 402-capable developer client
- `packages/contracts` — Soroban marketplace registry
- `packages/stellar` — wallet and Stellar transaction utilities
- `packages/api-sdk` — reusable paid API client
- `docs` — architecture, security, deployment, and evidence records

## Local checks

```powershell
pnpm test
Set-Location packages/contracts
cargo test
```

Open `apps/web/index.html` for the current marketplace demo. The API module verifies receipts through an injected verifier; connecting it to a deployed Testnet receipt indexer remains required before a payment claim can be made.
