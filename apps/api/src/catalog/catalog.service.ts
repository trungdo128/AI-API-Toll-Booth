import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const products = await this.prisma.apiProduct.findMany({
      where: { active: true, provider: { status: "APPROVED" } },
      include: { plans: true, provider: { select: { displayName: true } } },
      orderBy: { title: "asc" },
    });
    return products.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      category: product.category,
      provider: product.provider.displayName,
      plans: product.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        mode: plan.mode,
        asset: plan.asset,
        amount: plan.amount.toString(),
      })),
    }));
  }

  async bySlug(slug: string) {
    const product = await this.prisma.apiProduct.findFirst({
      where: { slug, active: true, provider: { status: "APPROVED" } },
      include: { plans: true, provider: { select: { displayName: true } } },
    });
    if (!product) throw new Error("API product not found");
    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      description: product.description,
      category: product.category,
      provider: product.provider.displayName,
      plans: product.plans.map((plan) => ({ ...plan, amount: plan.amount.toString() })),
    };
  }
}
