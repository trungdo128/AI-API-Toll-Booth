import { describe, expect, it } from "vitest";
import { CatalogService } from "../src/catalog/catalog.service.js";
import type { PrismaService } from "../src/database/prisma.service.js";

describe("CatalogService", () => {
  it("serializes bigint plan amounts without exposing upstream credentials", async () => {
    const prisma = {
      apiProduct: {
        findMany: async () => [{
          id: "api-id",
          slug: "summary",
          title: "Summary",
          description: "Text",
          category: "ai",
          upstreamUrlEncrypted: "secret",
          credentialEncrypted: "secret",
          provider: { displayName: "Provider" },
          plans: [{ id: "plan", name: "Per request", mode: "PER_REQUEST", asset: "native", amount: 300000n }],
        }],
      },
    } as unknown as PrismaService;

    const result = await new CatalogService(prisma).list();
    expect(result[0]?.plans[0]?.amount).toBe("300000");
    expect(result[0]).not.toHaveProperty("upstreamUrlEncrypted");
    expect(result[0]).not.toHaveProperty("credentialEncrypted");
  });
});
