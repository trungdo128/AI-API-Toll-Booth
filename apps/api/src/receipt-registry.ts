import { Injectable, Optional } from "@nestjs/common";
import { PrismaService } from "./database/prisma.service.js";

@Injectable()
export class ReceiptRegistry {
  private readonly receipts = new Set<string>();

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async has(receipt: string): Promise<boolean> {
    if (this.receipts.has(receipt)) return true;
    if (!this.prisma) return false;
    return Boolean(await this.prisma.paymentReceipt.findUnique({
      where: { transactionHash: receipt },
      select: { id: true },
    }));
  }

  add(receipt: string): void {
    this.receipts.add(receipt);
  }
}
