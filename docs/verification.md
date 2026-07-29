# Verification record

Verified locally and on Stellar Testnet on 2026-07-29.

```powershell
pnpm test
Set-Location packages/contracts
cargo test
stellar contract build
```

The optimized release artifact is 11,387 bytes with SHA-256 `4acd1614552fb7d6048a0edaf8cdb42373e3c23854271ad0465f395f9ea8b6ed`. It is deployed as [`CCSC…LMQK`](https://lab.stellar.org/r/testnet/contract/CCSCHYIM3XNM7OD2264C2FR4MBN2EKCA7M7VVAJESS4SAXYU64H2LMQK); exact deployment metadata is in [`deployments/testnet.json`](../deployments/testnet.json).
