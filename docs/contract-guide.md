# Contract guide

The registry contract keeps only provider/API identifiers, price/config state, roles, pause/version data and events. Credentials, request bodies, analytics and feedback stay off-chain.

Build and test with README commands, regenerate TypeScript bindings after interface changes and deploy only optimized Wasm. Mainnet is not authorized by this specification.

The current optimized Wasm is 11,387 bytes. Stellar CLI produced the same size after a second optimization pass, so deployment must reuse this reviewed artifact rather than adding on-chain presentation, analytics or user data.
