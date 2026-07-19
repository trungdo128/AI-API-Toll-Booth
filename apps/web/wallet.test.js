import test from "node:test";
import assert from "node:assert/strict";
import { connectWallet } from "./wallet.js";

test("connects Freighter only when it reports Stellar Testnet", async () => {
  const wallet = await connectWallet("freighter", {
    freighterApi: {
      requestAccess: async () => ({ address: "GTEST" }),
      getNetwork: async () => ({ network: "TESTNET" }),
    },
  });
  assert.equal(wallet.address, "GTEST");
  await assert.rejects(connectWallet("freighter", {
    freighterApi: { requestAccess: async () => ({ address: "GTEST" }), getNetwork: async () => ({ network: "PUBLIC" }) },
  }), /Switch Freighter/);
});

test("uses the official SDK connection check when no legacy global exists", async () => {
  const wallet = await connectWallet("freighter", {
    __freighterSdk: {
      isConnected: async () => ({ isConnected: true }),
      requestAccess: async () => ({ address: "GSDK" }),
      getNetwork: async () => ({ network: "TESTNET" }),
    },
  });
  assert.equal(wallet.address, "GSDK");
});
