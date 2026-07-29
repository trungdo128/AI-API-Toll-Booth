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

The browser builds one exact native-XLM payment, Freighter signs it, Horizon submits it, and the backend verifies the transaction before issuing a replay-safe receipt.

## Verified Mainnet activity

Fourteen Mainnet users registered directly with the registry contract and then completed the production HTTP 402 payment flow. The backend verified every payment and the live [usage dashboard](https://ai-api-toll-booth-production.up.railway.app/dashboard/) reads those receipts from PostgreSQL.

| Wallet | Registry transaction | Verified payment |
|---:|---|---|
| 01 | [`6dd8bed3…44eb`](https://stellar.expert/explorer/public/tx/6dd8bed38620aef9ba3efbbffa2ea27f6f787118571ba7adbe707417dd8c44eb) | [`8c879382…23b8`](https://stellar.expert/explorer/public/tx/8c8793821a5b75fe3e38964eb4030170a9713537d674522674fc32facaf123b8) |
| 02 | [`c127cb64…b960`](https://stellar.expert/explorer/public/tx/c127cb64e6e0f1fbef846d53988d0ce4f68b314930c792f39d6a69824d1bb960) | [`fa3c5420…0f9d`](https://stellar.expert/explorer/public/tx/fa3c5420866c8e699d588911bf21443ccd939199f952d64d065e2bb12b540f9d) |
| 03 | [`9e0a07c7…ad99`](https://stellar.expert/explorer/public/tx/9e0a07c79087db9e350588ec5d728e99e730faaa9dcc80d07391b7234031ad99) | [`19f448e1…40eb`](https://stellar.expert/explorer/public/tx/19f448e1306697fa37d293f70aaa48c592f26e10a7472688237db4e6a0bf40eb) |
| 04 | [`79d69183…66aa`](https://stellar.expert/explorer/public/tx/79d6918333a363562d66e0b8ee7a8e2b2fb000c2a7e41bdd4abe0e8effc166aa) | [`12c702d0…d54`](https://stellar.expert/explorer/public/tx/12c702d0b9ff64db90fc830927c0570ab2d04a047a9dd503628d613e36914d54) |
| 05 | [`69ca1f48…88b4`](https://stellar.expert/explorer/public/tx/69ca1f48fa2f912c510633afde60e8a0d3e26d6cf72c81519a951fa93a6988b4) | [`d441883f…10d7`](https://stellar.expert/explorer/public/tx/d441883f035eb782464c7eb32c0fe832187c423503d64b935e6a9f090c2610d7) |
| 06 | [`b4ec1b11…7060`](https://stellar.expert/explorer/public/tx/b4ec1b1151c22837491d452f384da0857eea3f6fbacea67d8f560ce4d73a7060) | [`6fd2f60b…3a89`](https://stellar.expert/explorer/public/tx/6fd2f60b1f7b6a5e11eceb0083604d7c391b3857c8f3ff8ff707165a2d503a89) |
| 07 | [`2aeb9d2e…fb97`](https://stellar.expert/explorer/public/tx/2aeb9d2eb7cb0893c72cd526907d7897d3a0e690ec7658f044515acd9e7afb97) | [`0e369a16…ce65`](https://stellar.expert/explorer/public/tx/0e369a16a9ca6921b5f5acae2db864b13b0e6dfc0acd3f29b437ad56b3bece65) |
| 08 | [`1ab5f457…d918`](https://stellar.expert/explorer/public/tx/1ab5f45716497c3fe6577a859ea20dde50050aa3f6d25443f958535a4834d918) | [`0ae480c3…aa06`](https://stellar.expert/explorer/public/tx/0ae480c3dc6d97d596e4e087a2352102d0673956a65b438e4949857cfe78aa06) |
| 09 | [`142e0238…39f2`](https://stellar.expert/explorer/public/tx/142e023886f889597d818650b79190faae448e89bd9e6e9d82486bb3bcf039f2) | [`37eebc4e…e98b`](https://stellar.expert/explorer/public/tx/37eebc4ef469e2acc03a81bf217937124b16127a2afac189368aa71dd208e98b) |
| 10 | [`27c0b35b…6c6b`](https://stellar.expert/explorer/public/tx/27c0b35baefdcfcd718d4a438baf169029ca1057eadb330aa4e647335a1f6c6b) | [`4630b9fc…a631`](https://stellar.expert/explorer/public/tx/4630b9fc139c02155194ba2a8b28a6ce568075d0264ec9656433e2b9e376a631) |
| 11 | [`70ed40e5…fef3`](https://stellar.expert/explorer/public/tx/70ed40e58abbab15bc114e39c5017b8458ef2e48b1333a25de567aa85afbfef3) | [`0102ff1d…518b`](https://stellar.expert/explorer/public/tx/0102ff1d4739d2178b470121ae769a8fe12b5bcdcc167b95c273b83104f8518b) |
| 12 | [`77e09a74…5a7c`](https://stellar.expert/explorer/public/tx/77e09a7460356d8fd4b7100b985181364add9dc688c851af65b6824d2bfe5a7c) | [`9bab672c…3bb2`](https://stellar.expert/explorer/public/tx/9bab672c3dd34b2a3ff356a4fd23e8281229ef73b7682da17843267d6dde3bb2) |
| 13 | [`b28fd9a2…849f`](https://stellar.expert/explorer/public/tx/b28fd9a2e61f61095eda84dd55f3459d23352e01ae52501e43885c2479bc849f) | [`1b724896…6d11`](https://stellar.expert/explorer/public/tx/1b724896e1da4e2e66d4f90fc7125b8dcc3e4cd31d47aee5f5ac835b17356d11) |
| 14 | [`cf03befc…c1e0`](https://stellar.expert/explorer/public/tx/cf03befc0d0932c258e23f9c6abbc53349f743589de3e577ccdfa3d433afc1e0) | [`4450114d…1ec4`](https://stellar.expert/explorer/public/tx/4450114d76babff0bffb5b20e23bdaca4133b2be7da4c91b195a0c95846a1ec4) |

The 22-user Mainnet validation set is split across this project (users 01–14) and [Proof-of-Visit Deposit](https://github.com/thomashuyyngo/PoVDeposit) (users 15–22).

## Level 6 submission

| Requirement | Evidence |
|---|---|
| Public GitHub repository | [trungdo128/AI-API-Toll-Booth](https://github.com/trungdo128/AI-API-Toll-Booth) |
| Minimum 30+ meaningful commits | Repository history contains more than 30 commits |
| Live Mainnet application | [Railway production](https://ai-api-toll-booth-production.up.railway.app/) |
| Mainnet contract address | [`CAUZ…LG7X`](https://stellar.expert/explorer/public/contract/CAUZWSIVXANXFQWJWY4QYWCZUBV7NNSG54C7IRYI2MY7DY2UYDIDLG7X) |
| Proof of Mainnet users | 14 direct contract users above; 22-user cross-project Mainnet set documented |
| Transaction activity proof | Registry and verified-payment hashes above |
| Audit/security review proof | [Full security audit report](docs/security/security-audit.md), [security policy](SECURITY.md) and [threat model](docs/security/threat-model.md) |
| Twitter/X launch channel | [@Hsoboi](https://x.com/Hsoboi) |
| Demo video | [Google Drive walkthrough](https://drive.google.com/file/d/1Vg_dZoxW_-eq9xbKuzMGN3zEjX7rDLpH/view?usp=drive_link) |
| Technical documentation | [Architecture](docs/architecture.md), [API reference](docs/api-reference.md), [contract guide](docs/contract-guide.md) |
| User guide/documentation | [User guide](docs/user-guide.md) |
| Community contribution | [Reusable HTTP 402 integration guide](docs/community-contribution.md) |

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

## Screenshots

The production release includes responsive desktop and mobile layouts. Submission screenshots are captured from the deployed Mainnet revision.

## Security

- Mainnet payments move real XLM; confirm the amount and recipient in Freighter before signing.
- The published review is an internal security review, not an independent third-party audit.
- Mainnet user evidence is linked to public contract and payment transactions above.

See the [security policy](SECURITY.md), [threat model](docs/security/threat-model.md), [architecture](docs/architecture.md), [contract guide](docs/contract-guide.md) and [user guide](docs/user-guide.md).
