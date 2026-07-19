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
