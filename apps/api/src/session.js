export function createSessionStore() {
  const sessions = new Map();

  return {
    open({ id, credit }) {
      if (!id || !Number.isInteger(credit) || credit <= 0) throw new Error("invalid session");
      if (sessions.has(id)) throw new Error("session already exists");
      sessions.set(id, { remaining: credit, closed: false });
    },
    consume(id, amount) {
      const session = sessions.get(id);
      if (!session || session.closed) throw new Error("session unavailable");
      if (!Number.isInteger(amount) || amount <= 0 || amount > session.remaining) {
        throw new Error("insufficient session credit");
      }
      session.remaining -= amount;
      return { remaining: session.remaining };
    },
    close(id) {
      const session = sessions.get(id);
      if (!session || session.closed) throw new Error("session unavailable");
      session.closed = true;
      return { refund: session.remaining };
    },
  };
}

function requireSessionValue(value, name) {
  if (!value) throw new Error(`missing ${name}`);
}

async function inTransaction(pool, operation) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function createDatabaseSessionService(pool) {
  return {
    open: async ({ id, wallet, apiId, receipt, credit }) => {
      requireSessionValue(id, "session id");
      requireSessionValue(wallet, "wallet");
      requireSessionValue(apiId, "API id");
      requireSessionValue(receipt, "receipt");
      if (!Number.isInteger(credit) || credit <= 0) throw new Error("invalid session credit");

      return inTransaction(pool, async (client) => {
        const payment = await client.query(
          `SELECT amount_atomic FROM payment_receipts
           WHERE receipt_id = $1 AND wallet_address = $2 AND api_id = $3
           FOR UPDATE`,
          [receipt, wallet, apiId],
        );
        if (payment.rowCount !== 1 || Number(payment.rows[0].amount_atomic) < credit) {
          throw new Error("receipt does not fund this session");
        }
        await client.query(
          `INSERT INTO payment_sessions
             (session_id, wallet_address, api_id, funding_receipt_id, credit_atomic, remaining_atomic, status)
           VALUES ($1, $2, $3, $4, $5, $5, 'OPEN')`,
          [id, wallet, apiId, receipt, credit],
        );
        return { id, remaining: credit };
      });
    },
    consume: async ({ id, amount }) => {
      requireSessionValue(id, "session id");
      if (!Number.isInteger(amount) || amount <= 0) throw new Error("invalid usage amount");

      return inTransaction(pool, async (client) => {
        const session = await client.query(
          `UPDATE payment_sessions
           SET remaining_atomic = remaining_atomic - $2
           WHERE session_id = $1 AND status = 'OPEN' AND remaining_atomic >= $2
           RETURNING remaining_atomic`,
          [id, amount],
        );
        if (session.rowCount !== 1) throw new Error("insufficient session credit");
        await client.query(
          "INSERT INTO usage_records (session_id, amount_atomic) VALUES ($1, $2)",
          [id, amount],
        );
        return { remaining: Number(session.rows[0].remaining_atomic) };
      });
    },
    close: async ({ id }) => {
      requireSessionValue(id, "session id");
      return inTransaction(pool, async (client) => {
        const session = await client.query(
          `UPDATE payment_sessions SET status = 'CLOSED'
           WHERE session_id = $1 AND status = 'OPEN'
           RETURNING remaining_atomic`,
          [id],
        );
        if (session.rowCount !== 1) throw new Error("session unavailable");
        return { refund: Number(session.rows[0].remaining_atomic) };
      });
    },
  };
}
