# Security Audit Report

## Audit record

| Field | Value |
|---|---|
| Project | AI API Toll Booth |
| Review type | Internal security audit |
| Review date | 2026-07-29 |
| Reviewed branch | `development` |
| Reviewed revision | `b8757ac` |
| Network | Stellar Mainnet |
| Contract | [`CAUZWSIVXANXFQWJWY4QYWCZUBV7NNSG54C7IRYI2MY7DY2UYDIDLG7X`](https://stellar.expert/explorer/public/contract/CAUZWSIVXANXFQWJWY4QYWCZUBV7NNSG54C7IRYI2MY7DY2UYDIDLG7X) |

## Scope

The review covers the Soroban registry contract, wallet authentication, HTTP 402 challenge generation, Mainnet payment verification, receipt replay protection, provider credential handling, database constraints, browser security headers, dependency controls and production deployment configuration.

## Method

- Manual review of contract authorization, initialization, mutation boundaries, event emission and storage lifetime.
- Manual tracing of the complete payment path from wallet approval through Horizon verification and receipt creation.
- Automated Rust formatting, linting, contract behavior and optimized Wasm compilation checks.
- Automated API, TypeScript, production build and browser-flow verification.
- Dependency vulnerability and repository secret scanning in CI.
- Public Mainnet confirmation using the registry and payment transactions listed in the project README.

## Control assessment

| Area | Security control | Result |
|---|---|---|
| Contract initialization | Configuration can be initialized once | Pass |
| Authorization | Provider and administrative mutations require the correct signer | Pass |
| Payment integrity | Asset, recipient, amount, request hash, network and expiry are bound to one challenge | Pass |
| Receipt replay | Transaction hash and challenge use are unique in PostgreSQL | Pass |
| Network safety | Production wallet and backend verification require Stellar Mainnet | Pass |
| Credential isolation | Provider upstream credentials remain server-side | Pass |
| Input handling | API trust boundaries use bounded schema validation | Pass |
| Browser protection | Security headers and restricted content policy are enabled | Pass |
| Secret hygiene | Environment secrets are excluded from Git and scanned in CI | Pass |
| Operational evidence | Fourteen Mainnet users have public registry and payment transactions | Pass |

## Findings

| ID | Severity | Finding | Resolution |
|---|---|---|---|
| ATB-01 | Medium | Historical activity could appear beside Mainnet receipts | Resolved by filtering production activity to `PUBLIC` network receipts |
| ATB-02 | Low | A compromised administrative signer could pause registry mutations | Documented operational risk; use multisignature custody for production administration |
| ATB-03 | Informational | External infrastructure availability affects RPC and indexing latency | Health monitoring and retry-safe verification are enabled |

No unresolved critical or high-severity finding was identified in the reviewed revision.

## Mainnet evidence

- Wasm upload: [`6a29e003…15ed`](https://stellar.expert/explorer/public/tx/6a29e0038c878587752b6e57a309f35ec97326a0efc286c6a60b67b0a09815ed)
- Contract deployment: [`701f56be…fd6e`](https://stellar.expert/explorer/public/tx/701f56be39dc3b6eb67a9656695d4bae46bc76e8275d38fbee9be9b075fcfd6e)
- Initialization: [`13cd387c…6a74`](https://stellar.expert/explorer/public/tx/13cd387c7a793b111a7f5a10d936ff3ca32390a78bb782b8364175df6b5e6a74)
- User activity: fourteen registry transactions and fourteen verified payments are linked in the README.
- CI evidence: [GitHub Actions verification](https://github.com/trungdo128/AI-API-Toll-Booth/actions)

## Conclusion

The reviewed Mainnet release has appropriate controls for its current scope and no unresolved critical or high-severity finding. This report is an internal point-in-time security audit and does not represent certification by an independent audit firm.
