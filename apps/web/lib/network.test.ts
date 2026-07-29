import { describe, expect, it } from "vitest";
import { isExpectedNetwork, isTestnet } from "./network";

describe("isTestnet", () => {
  it("accepts only Stellar Testnet", () => {
    expect(isTestnet({ network: "TESTNET" })).toBe(true);
    expect(isTestnet({ network: "PUBLIC" })).toBe(false);
    expect(isTestnet({ networkPassphrase: "Test SDF Network ; September 2015" })).toBe(true);
  });
});

it("accepts PUBLIC when the application targets Mainnet", () => {
  expect(isExpectedNetwork({ network: "PUBLIC" }, "PUBLIC")).toBe(true);
  expect(isExpectedNetwork({ network: "TESTNET" }, "PUBLIC")).toBe(false);
});
