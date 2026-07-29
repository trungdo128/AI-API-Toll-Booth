# Testnet deployment

Railway builds the monorepo, runs Prisma migrations against Neon and starts the NestJS service, which serves the static Next.js export. Configure all values from `.env.example` as protected Railway variables.

Deploy the optimized current Wasm once, initialize it once, record contract ID, transaction hashes, deployer public address, commit SHA and date in `deployments/testnet.json`, then update evidence documents. Never reuse Testnet evidence as a Mainnet claim.
