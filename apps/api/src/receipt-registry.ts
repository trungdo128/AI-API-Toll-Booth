import { Injectable } from "@nestjs/common";

@Injectable()
export class ReceiptRegistry {
  private readonly receipts = new Set<string>();

  has(receipt: string): boolean {
    return this.receipts.has(receipt);
  }

  add(receipt: string): void {
    this.receipts.add(receipt);
  }
}
