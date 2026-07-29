# Threat model

| Threat | Control | Residual risk |
| --- | --- | --- |
| Replayed wallet signature | Origin/network/nonce/expiry binding, one-time challenge, hashed session token | Stolen active bearer token until short expiry |
| Wrong-network payment | Testnet-only wallet check plus backend Testnet lookup | Misconfigured RPC/Horizon endpoint |
| Forged or reused receipt | Exact asset/recipient/amount/request verification and unique transaction hash | Indexer delay |
| Price/request manipulation | Signed requirement binds API, request hash, amount and expiry | Compromised provider configuration |
| Provider credential leak | Server-side encrypted storage; never returned by catalog | Key-management failure |
| Admin/upgrade abuse | Contract authorization, pause boundaries, audit records; multisig before Mainnet | Single-key Testnet operations |
| Double settlement/accounting | Strict contract state and database uniqueness/transactions | Reconciliation bug |
| Dependency/secret compromise | Lockfile, CI audit, gitleaks, least-privilege secrets | Upstream zero-day |
| Denial of service | Input bounds and rate limiting required at edge | Distributed traffic |

Trust boundaries are browser extension, public web/API, PostgreSQL, Stellar RPC/Horizon, Soroban contract and provider upstream. Mainnet remains blocked until external review and multisig controls.
