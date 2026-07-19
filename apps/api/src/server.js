import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import pg from "pg";
import { health } from "./health.js";
import { createTollHandler } from "./toll.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../../web/index.html");
const toll = createTollHandler({
  price: 300_000,
  verifyReceipt: async (receipt) => {
    const result = await pool.query("SELECT 1 FROM payment_receipts WHERE receipt_id = $1", [receipt]);
    return result.rowCount === 1;
  },
});

createServer(async (request, response) => {
  try {
    if (request.url === "/health") {
      await pool.query("SELECT 1");
      response.writeHead(200, { "content-type": "application/json" });
      return response.end(JSON.stringify(health()));
    }
    if (request.url === "/api/protected") {
      const result = await toll({ headers: request.headers });
      response.writeHead(result.status, { "content-type": "application/json" });
      return response.end(JSON.stringify(result.body));
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return response.end(await readFile(webRoot));
  } catch {
    response.writeHead(503, { "content-type": "application/json" });
    return response.end(JSON.stringify({ error: "service unavailable" }));
  }
}).listen(Number(process.env.PORT || 3000));
