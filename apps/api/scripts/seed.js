import pg from "pg";

const { Pool } = pg;
const provider = "GB7CDHVP6LBMP3L5BJFXSTOWB4NX7ONPFN4537AFCWCNL7YD2MHSBZJN";
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

await pool.query(
  "INSERT INTO users (wallet_address) VALUES ($1) ON CONFLICT DO NOTHING",
  [provider],
);
await pool.query(
  `INSERT INTO api_products (api_id, provider_wallet, price_atomic, active)
   VALUES ('summary', $1, 300000, true)
   ON CONFLICT (api_id) DO UPDATE SET price_atomic = EXCLUDED.price_atomic, active = EXCLUDED.active`,
  [provider],
);

await pool.end();
console.log("D7 seed complete");
