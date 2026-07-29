# Architecture

`Next.js marketplace/console → NestJS gateway → PostgreSQL`

`Freighter → Stellar Mainnet payment → Horizon/RPC verification → receipt → protected upstream`

Soroban stores registry and pricing governance. The backend owns authentication, encrypted upstream access, request hashes, payment challenges/receipts, sessions, usage and reconciliation.
