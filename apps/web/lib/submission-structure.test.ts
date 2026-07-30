import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("judged submission entrypoints", () => {
  it("exposes the Soroban source in the conventional root contract folder", () => {
    expect(existsSync(resolve(process.cwd(), "../../contracts/api_marketplace_registry/src/lib.rs"))).toBe(true);
  });

  it("keeps a frontend call whose name matches the Soroban function", () => {
    const integration = readFileSync(resolve(process.cwd(), "lib/stellar-payment.ts"), "utf8");
    expect(integration).toContain("register_provider");
  });
});
