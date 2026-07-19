# AI API Toll Booth Implementation Plan

**Goal:** Build a Testnet-only paid API marketplace with verified HTTP 402 charge and session flows.

**Architecture:** pnpm monorepo with Next.js marketplace, NestJS payment gateway, PostgreSQL/Redis state, Soroban registry contract, and a reusable TypeScript paid-API client. Only public wallet addresses and hashes cross the application boundary; secrets remain in wallet extensions or test-only environment variables.

## Global constraints

- Stellar Testnet only; no Mainnet deployment or claims.
- Freighter and Rabet are the only user-facing wallets.
- No wallet seed phrase, private key, upstream credential, or personal API response is committed or logged.
- HTTP 402 receipts are nonce-bound, time-bound, network-bound, asset-bound, recipient-bound, and idempotent.
- The five feedback commits are deferred until real external feedback exists.

## Delivery sequence

1. Bootstrap the pnpm workspace, strict TypeScript, formatting, CI, Docker dependencies, and baseline documentation.
2. Implement and test the Rust `ApiMarketplaceRegistry` contract: initialization, provider/API lifecycle, pause, events, and authorization.
3. Build shared Stellar types, contract bindings, wallet capability detection, and Testnet-only signing state.
4. Build NestJS persistence, wallet challenge authentication, provider/catalog services, and OpenAPI/health endpoints.
5. Implement HTTP 402 charge verification with replay prevention, receipt persistence, and deterministic protected demo APIs.
6. Implement payment sessions, quotas, settlement records, and concurrency tests.
7. Build the reusable `@project/stellar-paid-api-client` and CLI agent client.
8. Build the marketplace, provider dashboard, payment flow, receipts, admin moderation, and responsive accessibility states.
9. Add security documentation, threat-model controls, test coverage, CI, Testnet deployment records, and only factual evidence.
