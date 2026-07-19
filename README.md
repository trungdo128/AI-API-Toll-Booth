# AI API Toll Booth

AI API Toll Booth is a Stellar Testnet API marketplace where providers can sell protected API access and clients can pay per request or from a funded session.

## Status

The registry is deployed and initialized on Stellar Testnet. Mainnet deployment, stablecoin integration, user evidence, external audits, and demo video are intentionally not claimed.

## Testnet deployment

- Registry v2: [`CCPPSFL6A5VMZNOYH3J2YJREPTC6TJPQIKBXKF6IJ725CRYUDBVYRTKT`](https://lab.stellar.org/r/testnet/contract/CCPPSFL6A5VMZNOYH3J2YJREPTC6TJPQIKBXKF6IJ725CRYUDBVYRTKT)
- Deploy transaction: [`593ce6de…6b9d21`](https://stellar.expert/explorer/testnet/tx/593ce6de10c9575a0cce16b849a8ede6be4f6096c9c7e4f1810f81e92d6b9d21)
- Initialize transaction: [`fec6d7b3…427389`](https://stellar.expert/explorer/testnet/tx/fec6d7b32a8ec8f6e51d23e3b3ae5d8fca81f873d90c739dd132945ee7427389)
- Payment asset: native Testnet XLM asset contract, used only for deployment verification—not represented as a stablecoin.
- On-chain catalog evidence: v2 provider registration ([transaction](https://stellar.expert/explorer/testnet/tx/79f31832115e666c083fe8a160d98ecc92a1b14e40be461e63e71696fa47d633)), `summary` API registration ([transaction](https://stellar.expert/explorer/testnet/tx/0ebd735056fba04886a92af7d2b2acd920b8b29704d829cc4e3f801141843ad9)), and provider-authorized price update to `300000` ([transaction](https://stellar.expert/explorer/testnet/tx/55e8ce5bc3d07b96227d7ef8062594aff5254142472d9b7ab529e36d957b6fe2)).

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
