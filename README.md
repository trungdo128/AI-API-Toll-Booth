# AI API Toll Booth

AI API Toll Booth is a Stellar Testnet API marketplace where providers can sell protected API access and clients can pay per request or from a funded session.

## Status

The registry is deployed and initialized on Stellar Testnet. Mainnet deployment, stablecoin integration, user evidence, external audits, and demo video are intentionally not claimed.

## Testnet deployment

- Registry: [`CCK5A36MDO4VOCXX5S2SOMR7DOTBH3IIOT2UMB47JHESEVCW6TRZ2ZYR`](https://lab.stellar.org/r/testnet/contract/CCK5A36MDO4VOCXX5S2SOMR7DOTBH3IIOT2UMB47JHESEVCW6TRZ2ZYR)
- Deploy transaction: [`1bf52f42…cff8e5`](https://stellar.expert/explorer/testnet/tx/1bf52f42a94f0f6b87f321cfbf03b69e6599aa95214e0c0ff22be21319cff8e5)
- Initialize transaction: [`2b12c74c…0d8ddb`](https://stellar.expert/explorer/testnet/tx/2b12c74c15c5069529eac866a2fc41fd201135c241f5d8d984c839cfd20d8ddb)
- Payment asset: native Testnet XLM asset contract, used only for deployment verification—not represented as a stablecoin.
- On-chain catalog evidence: test provider registration ([transaction](https://stellar.expert/explorer/testnet/tx/2f257836cbcc1ffa1fa0852f62268e899bddb5763bb0d5d18e9c5c82df088e98)) and `summary` API product registration ([transaction](https://stellar.expert/explorer/testnet/tx/0975928eefaf1d8332709296d745927d55148364ae21ad587194e89820eab177)).

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
