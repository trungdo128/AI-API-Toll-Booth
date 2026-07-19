import test from "node:test";
import assert from "node:assert/strict";
import { createSessionStore } from "../src/session.js";

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
