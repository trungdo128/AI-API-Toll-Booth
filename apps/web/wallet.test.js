import test from "node:test";
import assert from "node:assert/strict";
import { connectWallet } from "./wallet.js";

test("connects Freighter only when it reports Stellar Mainnet", async () => {
  const wallet = await connectWallet("freighter", {
    __freighterSdk: { freighterApi: {
      requestAccess: async () => ({ address: "GMAIN" }),
      getNetwork: async () => ({ network: "PUBLIC" }),
      isConnected: async () => ({ isConnected: true }),
    } },
  });
  assert.deepEqual(wallet, { kind: "freighter", address: "GMAIN", signing: "signTransaction", network: "PUBLIC" });
  await assert.rejects(connectWallet("freighter", {
    __freighterSdk: { freighterApi: { requestAccess: async () => ({ address: "GTEST" }), getNetwork: async () => ({ network: "TESTNET" }), isConnected: async () => ({ isConnected: true }) } },
  }), /Switch Freighter/);
});

test("uses the official SDK connection check when no legacy global exists", async () => {
  const wallet = await connectWallet("freighter", {
    __freighterSdk: { freighterApi: {
      isConnected: async () => ({ isConnected: true }),
      requestAccess: async () => ({ address: "GSDK" }),
      getNetwork: async () => ({ networkPassphrase: "Public Global Stellar Network ; September 2015" }),
    } },
  });
  assert.equal(wallet.address, "GSDK");
});

test("uses the official browser global without transforming SDK exports", async () => {
  const wallet = await connectWallet("freighter", {
    freighterApi: {
      isConnected: async () => ({ isConnected: true }),
      requestAccess: async () => ({ address: "GBROWSER" }),
      getNetwork: async () => ({ network: "PUBLIC" }),
    },
  });
  assert.equal(wallet.address, "GBROWSER");
});
