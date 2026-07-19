# AI API Toll Booth

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-5B6CFF?style=flat-square)
![Railway](https://img.shields.io/badge/Railway-Live-0B0D0D?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/trungdo128/AI-API-Toll-Booth/verify.yml?branch=development&label=CI&style=flat-square)

AI API Toll Booth is a Stellar Testnet API marketplace where providers can sell protected API access and clients can pay per request or from a funded session.

## Status

The registry is deployed and initialized on Stellar Testnet. Mainnet deployment, stablecoin integration, user evidence, external audits, and demo video are intentionally not claimed.

## Railway deployment

Railway successfully deployed the current `development` revision on 2026-07-19. The service runs `pnpm migrate && pnpm seed && pnpm start`, exposes `/health`, and uses Neon PostgreSQL.

- Public application: [ai-api-toll-booth-production.up.railway.app](https://ai-api-toll-booth-production.up.railway.app/)
- Health check: [`/health`](https://ai-api-toll-booth-production.up.railway.app/health) — verified HTTP 200 on 2026-07-19
- [Railway deployment dashboard](https://railway.com/project/1d4b1ad2-2416-466f-90de-a272e3f6b28b?environmentId=017eb7f9-e731-4a33-bee2-128d30e5d5eb)

## Testnet deployment

- Registry v3: [`CDCXMAI7YIONRCQ5NYEM2KIODHQRWYIGYSL7OLMLYAUE63K5XYL3AL5K`](https://lab.stellar.org/r/testnet/contract/CDCXMAI7YIONRCQ5NYEM2KIODHQRWYIGYSL7OLMLYAUE63K5XYL3AL5K)
- Deploy transaction: [`78a69281…5e76a9`](https://stellar.expert/explorer/testnet/tx/78a69281aa4fa4ebce28c6115e681bda9329963def563d8c12e0ee4d1c5e76a9)
- Initialize transaction: [`834fe675…e92aeb`](https://stellar.expert/explorer/testnet/tx/834fe675dca0d65a5497702cbf0a99e9835da772c2456b5be9f38d45d5e92aeb)
- Payment asset: native Testnet XLM asset contract, used only for deployment verification—not represented as a stablecoin.
- Current v3 catalog smoke test: a controlled Testnet wallet registered an active provider and active `summary7` API priced at `300000`; [wallet smoke evidence](docs/testnet-wallet-smoke.md).

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

Open `apps/web/index.html` for the current marketplace demo. The API module verifies receipts through an injected verifier; connecting it to a deployed Testnet receipt indexer remains required before a payment claim can be made. `POST /api/sessions`, `POST /api/sessions/:id/consume`, and `POST /api/sessions/:id/close` persist and account for a receipt-backed session; they do not submit Stellar transactions themselves.

## Service configuration

Set `DATABASE_URL` to the managed PostgreSQL connection string. `PORT` is optional and defaults to `3000`. Do not commit database credentials, wallet secrets, or Testnet key material.

See [security boundaries](docs/security.md) and the [verification record](docs/verification.md) for the tested scope and known production gaps.

## Level 6 submission status

| Requirement | Status | Evidence |
| --- | --- | --- |
| Public GitHub repository | Complete | [Repository](https://github.com/trungdo128/AI-API-Toll-Booth) |
| 30+ meaningful commits | Complete | `development` history exceeds 30 commits |
| Live application | Complete for Testnet | [Railway application](https://ai-api-toll-booth-production.up.railway.app/) |
| Mainnet application and contract address | Not completed | This project is Testnet-only; no Mainnet claim is made. |
| 20+ Mainnet users | Not completed | No Mainnet-user evidence is claimed. |
| Transaction activity | Complete for controlled Testnet QA | [Wallet smoke evidence](docs/testnet-wallet-smoke.md) |
| Audit/security review proof | Internal review only | [Security boundaries](docs/security.md); no external audit is claimed. |
| Technical documentation | Complete for the current Testnet scope | README, verification, security, and Testnet wallet evidence |
| User guide | In progress | The current web demo and README document the available Testnet flow. |
| Community contribution link | Not completed | No published reusable package is claimed. |
| Repository submission | Ready | Submit the repository URL above before the deadline. |
