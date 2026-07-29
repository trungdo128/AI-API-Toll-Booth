# AI API Toll Booth

![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-18C7FF?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/trungdo128/AI-API-Toll-Booth/verify.yml?branch=development&label=verify&style=flat-square)

AI API Toll Booth is a pay-per-request API marketplace. Providers publish approved API plans; clients receive an HTTP 402 challenge, pay the exact requirement on Stellar Testnet, and retry with a backend-verified receipt.

## Problem and solution

API buyers should not need a subscription before they know an endpoint is useful, and providers should not expose upstream credentials. The toll booth binds price, asset, recipient, request hash, nonce, network and expiry into one payment challenge. The backend verifies the Testnet transaction before granting access.

## Why Stellar

Stellar provides low-cost settlement, fast finality, public transaction evidence and Soroban contracts for registry, pricing and administrative limits. This release is Testnet-only. Native Testnet XLM is used for technical verification and is not described as a stablecoin.

## Roles and flow

- Consumer: connect Freighter on Testnet, inspect a plan, request access, pay, then retry with the receipt.
- Provider: apply, publish an encrypted-upstream API product and monitor usage.
- Admin: approve or suspend providers/products, pause registry creation and review audit records.

`request → HTTP 402 challenge → wallet approval → Testnet verification → receipt → retry → API response`

## Architecture

- `apps/web`: Next.js static export, accessible wallet flow, marketplace, provider/admin/docs pages and a lazy React Three Fiber hero.
- `apps/api`: NestJS, Prisma and PostgreSQL; replay-safe wallet sessions, catalog, payment verification and protected API routing.
- `apps/agent-client`: reference HTTP 402 client.
- `packages/contracts`: Rust Soroban marketplace registry.
- `packages/stellar`: generated TypeScript contract bindings.

Private keys and seed phrases are never requested. Provider credentials remain server-side. Database URLs and operational secrets belong in Railway/`.env`, never Git.

## Public Testnet environment

- Application: [ai-api-toll-booth-production.up.railway.app](https://ai-api-toll-booth-production.up.railway.app/)
- Health: [ `/health` ](https://ai-api-toll-booth-production.up.railway.app/health)
- Previously verified Testnet registry: [`CDCX…AL5K`](https://lab.stellar.org/r/testnet/contract/CDCXMAI7YIONRCQ5NYEM2KIODHQRWYIGYSL7OLMLYAUE63K5XYL3AL5K)
- Deployment transaction: [`78a69281…e76a9`](https://stellar.expert/explorer/testnet/tx/78a69281aa4fa4ebce28c6115e681bda9329963def563d8c12e0ee4d1c5e76a9)
- Initialization transaction: [`834fe675…92aeb`](https://stellar.expert/explorer/testnet/tx/834fe675dca0d65a5497702cbf0a99e9835da772c2456b5be9f38d45d5e92aeb)

The contract source has changed since that deployment. A fresh Testnet deployment and end-to-end payment evidence for the current Wasm are still required; the older address is retained only as historical verified evidence.

## Local setup

Requirements: Node.js 22, pnpm 10.18.3, Rust stable, the `wasm32v1-none` target, PostgreSQL and Stellar CLI.

```powershell
corepack pnpm install
Copy-Item apps/api/.env.example apps/api/.env
corepack pnpm --filter @toll-booth/api exec prisma generate
corepack pnpm --filter @toll-booth/api migrate
corepack pnpm --filter @toll-booth/api seed
corepack pnpm build
corepack pnpm start
```

Configure `DATABASE_URL`, `PUBLIC_ORIGIN`, `SESSION_SECRET`, `STELLAR_RPC_URL`, `STELLAR_HORIZON_URL`, `STELLAR_PAYMENT_ASSET`, `PAYMENT_RECIPIENT` and the current Testnet contract ID. Never commit `.env`.

## Verification

```powershell
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm --filter @toll-booth/web exec playwright test
cargo fmt --manifest-path packages/contracts/Cargo.toml --check
cargo clippy --manifest-path packages/contracts/Cargo.toml -- -D warnings
cargo test --manifest-path packages/contracts/Cargo.toml
cargo build --manifest-path packages/contracts/Cargo.toml --target wasm32v1-none --release
```

## Screenshots

The current desktop and mobile layouts are captured by Playwright during verification. Submission screenshots must be captured from the deployed revision after the next Railway deployment; local test artifacts are intentionally gitignored.

## Security and limitations

- Testnet only; do not send Mainnet funds.
- Current-source Testnet redeployment, current transaction smoke tests, 20 consented user flows, a real X launch URL and external audit evidence remain pending.
- Internal review is not an external audit.
- Exact 30 commits cannot be claimed: the repository history already exceeds 30 and has not been rewritten.

See [security policy](SECURITY.md), [threat model](docs/security/threat-model.md), [deployment guide](docs/deployment/testnet.md), [user guide](docs/user-guide.md), [testing](docs/testing.md) and [submission status](SUBMISSION_STATUS.md).
