import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { health } from "./health.js";
import { createDatabaseSessionService } from "./session.js";
import { createTollHandler } from "./toll.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const webDir = join(dirname(fileURLToPath(import.meta.url)), "../../web");
const webRoot = join(webDir, "index.html");
const freighterApiPath = fileURLToPath(import.meta.resolve("@stellar/freighter-api"));
const sessions = createDatabaseSessionService(pool);
const toll = createTollHandler({
  asset: process.env.STELLAR_PAYMENT_ASSET || "native",
  price: 300_000,
  verifyReceipt: async (receipt) => {
    const result = await pool.query("SELECT 1 FROM payment_receipts WHERE receipt_id = $1", [receipt]);
    return result.rowCount === 1;
  },
});

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw new Error("request body too large");
  }
  return JSON.parse(body || "{}");
}

function sendJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

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
    if (request.method === "POST" && request.url === "/api/sessions") {
      try {
        return sendJson(response, 201, await sessions.open({ id: randomUUID(), ...(await readJson(request)) }));
      } catch (error) {
        return sendJson(response, 422, { error: error.message });
      }
    }
    const sessionRoute = request.url.match(/^\/api\/sessions\/([^/]+)\/(consume|close)$/);
    if (request.method === "POST" && sessionRoute) {
      try {
        const [id, action] = sessionRoute.slice(1);
        const body = await readJson(request);
        const result = action === "consume"
          ? await sessions.consume({ id, amount: body.amount })
          : await sessions.close({ id });
        return sendJson(response, 200, result);
      } catch (error) {
        return sendJson(response, 422, { error: error.message });
      }
    }
    if (request.url === "/wallet.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      return response.end(await readFile(join(webDir, "wallet.js")));
    }
    if (request.url === "/app.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      return response.end(await readFile(join(webDir, "app.js")));
    }
    if (request.url === "/freighter-api.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "public, max-age=31536000, immutable" });
      return response.end(await readFile(freighterApiPath));
    }
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return response.end(await readFile(webRoot));
  } catch {
    response.writeHead(503, { "content-type": "application/json" });
    return response.end(JSON.stringify({ error: "service unavailable" }));
  }
}).listen(Number(process.env.PORT || 3000));
