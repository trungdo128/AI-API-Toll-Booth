# AI API Toll Booth

AI API Toll Booth is a Stellar Testnet API marketplace where providers can sell protected API access and clients can pay per request or from a funded session.

## Status

The registry is deployed and initialized on Stellar Testnet. Mainnet deployment, stablecoin integration, user evidence, external audits, and demo video are intentionally not claimed.

## Railway deployment

Railway successfully deployed the current `development` revision on 2026-07-19. The service runs `pnpm migrate && pnpm seed && pnpm start`, exposes `/health`, and uses Neon PostgreSQL. [Railway deployment dashboard](https://railway.com/project/1d4b1ad2-2416-466f-90de-a272e3f6b28b?environmentId=017eb7f9-e731-4a33-bee2-128d30e5d5eb)

## Testnet deployment

- Registry v3: [`CDCXMAI7YIONRCQ5NYEM2KIODHQRWYIGYSL7OLMLYAUE63K5XYL3AL5K`](https://lab.stellar.org/r/testnet/contract/CDCXMAI7YIONRCQ5NYEM2KIODHQRWYIGYSL7OLMLYAUE63K5XYL3AL5K)
- Deploy transaction: [`78a69281…5e76a9`](https://stellar.expert/explorer/testnet/tx/78a69281aa4fa4ebce28c6115e681bda9329963def563d8c12e0ee4d1c5e76a9)
- Initialize transaction: [`834fe675…e92aeb`](https://stellar.expert/explorer/testnet/tx/834fe675dca0d65a5497702cbf0a99e9835da772c2456b5be9f38d45d5e92aeb)
- Payment asset: native Testnet XLM asset contract, used only for deployment verification—not represented as a stablecoin.
- On-chain catalog evidence: v2 provider registration ([transaction](https://stellar.expert/explorer/testnet/tx/79f31832115e666c083fe8a160d98ecc92a1b14e40be461e63e71696fa47d633)), `summary` API registration ([transaction](https://stellar.expert/explorer/testnet/tx/0ebd735056fba04886a92af7d2b2acd920b8b29704d829cc4e3f801141843ad9)), and provider-authorized price update to `300000` ([transaction](https://stellar.expert/explorer/testnet/tx/55e8ce5bc3d07b96227d7ef8062594aff5254142472d9b7ab529e36d957b6fe2)).

## Workspace

- `apps/web` — marketplace and provider dashboard
- `apps/api` — payment gateway and protected API service
- `apps/agent-client` — HTTP 402-capable developer client
- `packages/contracts` — Soroban marketplace registry
- `docs` — security boundaries and verification records

## Local checks

```powershell
pnpm test
Set-Location packages/contracts
cargo test
```

Open `apps/web/index.html` for the current marketplace demo. The API module verifies receipts through an injected verifier; connecting it to a deployed Testnet receipt indexer remains required before a payment claim can be made.

## Service configuration

Set `DATABASE_URL` to the managed PostgreSQL connection string. `PORT` is optional and defaults to `3000`. Do not commit database credentials, wallet secrets, or Testnet key material.

See [security boundaries](docs/security.md) and the [verification record](docs/verification.md) for the tested scope and known production gaps.
