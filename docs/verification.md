# Verification record

Verified locally on 2026-07-19.

```powershell
pnpm test
Set-Location packages/contracts
cargo test
stellar contract build
```

The current release build produced `api_marketplace_registry.wasm` (5,705 bytes) with SHA-256 `a27a9e6ba9477469b48861e265d4793c42451bb708d4c00051124219f58e53b7`.

This is a local build record, not a Testnet deployment claim.
