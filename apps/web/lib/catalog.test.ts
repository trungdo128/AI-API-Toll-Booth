import { describe, expect, it } from "vitest";
import {
  assetLabel,
  entryPlan,
  formatAmount,
  productPrice,
  type CatalogProduct,
} from "./catalog";

function product(plans: CatalogProduct["plans"]): CatalogProduct {
  return {
    id: "product",
    slug: "text-summarizer",
    title: "AI Text Summarizer",
    description: "Deterministic concise summaries.",
    category: "text",
    provider: "Toll Booth Labs",
    plans,
  };
}

describe("formatAmount", () => {
  it("renders stroops with the seven decimals wallets show", () => {
    expect(formatAmount("300000", "native")).toBe("0.0300000 XLM");
    expect(formatAmount("10000000", "native")).toBe("1.0000000 XLM");
    expect(formatAmount("12345678", "native")).toBe("1.2345678 XLM");
  });

  it("keeps a non-native asset code", () => {
    expect(formatAmount("500000", "USDC")).toBe("0.0500000 USDC");
  });

  it("does not invent a price for a malformed amount", () => {
    expect(formatAmount("", "native")).toBe("— XLM");
    expect(formatAmount("0.03", "native")).toBe("— XLM");
  });
});

describe("assetLabel", () => {
  it("shows the native asset as XLM", () => {
    expect(assetLabel("native")).toBe("XLM");
    expect(assetLabel("USDC")).toBe("USDC");
  });
});

describe("entryPlan", () => {
  it("advertises the cheapest plan rather than the first one listed", () => {
    const chosen = entryPlan(product([
      { id: "b", name: "Bulk", mode: "PER_REQUEST", asset: "native", amount: "900000" },
      { id: "a", name: "Starter", mode: "PER_REQUEST", asset: "native", amount: "300000" },
    ]));

    expect(chosen?.id).toBe("a");
  });

  it("ignores plans whose amount is not a stroop integer", () => {
    expect(entryPlan(product([
      { id: "bad", name: "Broken", mode: "PER_REQUEST", asset: "native", amount: "free" },
    ]))).toBeUndefined();
  });
});

describe("productPrice", () => {
  it("formats the entry plan", () => {
    expect(productPrice(product([
      { id: "a", name: "Starter", mode: "PER_REQUEST", asset: "native", amount: "700000" },
    ]))).toBe("0.0700000 XLM");
  });

  it("says so when a product has no priced plan", () => {
    expect(productPrice(product([]))).toBe("Price on request");
  });
});
