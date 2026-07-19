import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    wallet_address TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS api_products (
    api_id TEXT PRIMARY KEY,
    provider_wallet TEXT NOT NULL,
    price_atomic BIGINT NOT NULL CHECK (price_atomic > 0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS payment_receipts (
    receipt_id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
    api_id TEXT NOT NULL REFERENCES api_products(api_id),
    transaction_hash TEXT NOT NULL UNIQUE,
    amount_atomic BIGINT NOT NULL CHECK (amount_atomic > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS payment_sessions (
    session_id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL REFERENCES users(wallet_address),
    api_id TEXT NOT NULL REFERENCES api_products(api_id),
    credit_atomic BIGINT NOT NULL CHECK (credit_atomic > 0),
    remaining_atomic BIGINT NOT NULL CHECK (remaining_atomic >= 0),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS usage_records (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES payment_sessions(session_id),
    amount_atomic BIGINT NOT NULL CHECK (amount_atomic > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

await pool.end();
console.log("D7 migration complete");
