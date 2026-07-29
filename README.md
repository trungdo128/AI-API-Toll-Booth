# AI API Toll Booth

![Stellar Mainnet](https://img.shields.io/badge/Stellar-Mainnet-14B8A6?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/trungdo128/AI-API-Toll-Booth/verify.yml?branch=development&label=verify&style=flat-square)

AI API Toll Booth is a pay-per-request API marketplace. Providers publish approved API plans; clients receive an HTTP 402 challenge, approve the exact XLM payment in Freighter, and retry with a backend-verified Mainnet receipt.

## Problem and solution

API buyers should not need a subscription before they know an endpoint is useful, and providers should not expose upstream credentials. The toll booth binds price, asset, recipient, request hash, nonce, network and expiry into one payment challenge. The backend verifies the Mainnet transaction before granting access.

## Why Stellar

Stellar provides low-cost settlement, fast finality, public transaction evidence and Soroban contracts for registry, pricing and administrative limits. The live release uses native Mainnet XLM.

## Roles and flow

- Consumer: connect Freighter on Mainnet, inspect a plan, request access, approve the payment, then retry with the receipt.
- Provider: apply, publish an encrypted-upstream API product and monitor usage.
- Admin: approve or suspend providers/products, pause registry creation and review audit records.

`request → HTTP 402 challenge → wallet approval → Mainnet verification → receipt → retry → API response`

## Architecture

- `apps/web`: Next.js static export, accessible wallet flow, marketplace, provider/admin/docs pages and a lazy React Three Fiber hero.
- `apps/api`: NestJS, Prisma and PostgreSQL; replay-safe wallet sessions, catalog, payment verification and protected API routing.
- `apps/agent-client`: reference HTTP 402 client.
- `packages/contracts`: Rust Soroban marketplace registry.
- `packages/stellar`: generated TypeScript contract bindings.

Private keys and seed phrases are never requested. Provider credentials remain server-side. Database URLs and operational secrets belong in Railway/`.env`, never Git.

## Live Mainnet deployment

- Application: [ai-api-toll-booth-production.up.railway.app](https://ai-api-toll-booth-production.up.railway.app/)
- Health: [ `/health` ](https://ai-api-toll-booth-production.up.railway.app/health)
- Registry contract: [`CAUZ…LG7X`](https://stellar.expert/explorer/public/contract/CAUZWSIVXANXFQWJWY4QYWCZUBV7NNSG54C7IRYI2MY7DY2UYDIDLG7X)
- Wasm upload: [`6a29e003…15ed`](https://stellar.expert/explorer/public/tx/6a29e0038c878587752b6e57a309f35ec97326a0efc286c6a60b67b0a09815ed)
- Contract deployment: [`701f56be…fd6e`](https://stellar.expert/explorer/public/tx/701f56be39dc3b6eb67a9656695d4bae46bc76e8275d38fbee9be9b075fcfd6e)
- Initialization: [`13cd387c…6a74`](https://stellar.expert/explorer/public/tx/13cd387c7a793b111a7f5a10d936ff3ca32390a78bb782b8364175df6b5e6a74)

The browser builds one exact native-XLM payment, Freighter signs it, Horizon submits it, and the backend verifies the transaction before issuing a replay-safe receipt. Historical Testnet evidence remains in [`deployments/testnet.json`](deployments/testnet.json).

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

Configure `DATABASE_URL`, `PUBLIC_ORIGIN`, `SESSION_SECRET`, `STELLAR_RPC_URL`, `STELLAR_HORIZON_URL`, `PAYMENT_ASSET`, `PAYMENT_RECIPIENT` and the Mainnet contract ID. Never commit `.env`.

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

- Mainnet payments move real XLM; confirm the amount and recipient in Freighter before signing.
- Twenty consented user flows, a real X launch post URL and external audit evidence remain pending.
- Internal review is not an external audit.
- Exact 30 commits cannot be claimed: the repository history already exceeds 30 and has not been rewritten.

See [security policy](SECURITY.md), [threat model](docs/security/threat-model.md), [deployment guide](docs/deployment/testnet.md), [user guide](docs/user-guide.md), [testing](docs/testing.md) and [submission status](SUBMISSION_STATUS.md).
