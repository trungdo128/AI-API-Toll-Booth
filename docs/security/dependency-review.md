# Dependency review

Dependencies are pinned in `pnpm-lock.yaml` and `Cargo.lock`. CI runs `pnpm audit --audit-level high`; Rust and JavaScript updates require tests and review. A passing dependency scan is point-in-time evidence, not an audit.
