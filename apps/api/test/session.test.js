import test from "node:test";
import assert from "node:assert/strict";
import { createDatabaseSessionService, createSessionStore } from "../src/session.js";

test("tracks multiple paid calls against one funded session", () => {
  const sessions = createSessionStore();
  sessions.open({ id: "session-1", credit: 1_000_000 });

  assert.equal(sessions.consume("session-1", 250_000).remaining, 750_000);
  assert.equal(sessions.consume("session-1", 250_000).remaining, 500_000);
  assert.equal(sessions.close("session-1").refund, 500_000);
});

test("rejects usage that exceeds the funded credit", () => {
  const sessions = createSessionStore();
  sessions.open({ id: "session-2", credit: 100 });

  assert.throws(() => sessions.consume("session-2", 101), /insufficient session credit/);
});

test("opens a database session only from a matching unused receipt", async () => {
  const calls = [];
  const client = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith("SELECT amount_atomic")) return { rowCount: 1, rows: [{ amount_atomic: 1_000 }] };
      return { rowCount: 1, rows: [] };
    },
    release() {},
  };
  const sessions = createDatabaseSessionService({ connect: async () => client });

  const result = await sessions.open({
    id: "session-3",
    wallet: "GWALLET",
    apiId: "summary",
    receipt: "receipt-3",
    credit: 1_000,
  });

  assert.deepEqual(result, { id: "session-3", remaining: 1_000 });
  assert.match(calls[1].sql, /FOR UPDATE/);
  assert.match(calls[2].sql, /INSERT INTO payment_sessions/);
});

test("records a session usage only when the remaining credit covers it", async () => {
  const calls = [];
  const client = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.startsWith("UPDATE payment_sessions")) return { rowCount: 1, rows: [{ remaining_atomic: 750 }] };
      return { rowCount: 1, rows: [] };
    },
    release() {},
  };
  const sessions = createDatabaseSessionService({ connect: async () => client });

  assert.deepEqual(await sessions.consume({ id: "session-3", amount: 250 }), { remaining: 750 });
  assert.match(calls[1].sql, /remaining_atomic >= \$2/);
  assert.match(calls[2].sql, /INSERT INTO usage_records/);
});
