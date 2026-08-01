import type { QuoteRequestStatus } from "@prisma/client";

export type QuoteRequestModel = {
  id: number;
  companyName: string;
  contactName: string;
  phoneOrEmail: string;
  productNeed: string;
  expectedQuantityKg: number | null;
  note: string | null;
  status: QuoteRequestStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: Date | null;
  salesNote: string | null;
  customerRespondedAt: Date | null;
  convertedAt: Date | null;
  items: Array<{ id: number; productId: number | null; description: string; quantity: number; unit: string; unitPrice: number; lineTotal: number; product: { id: number; name: string; unit: string } | null }>;
  contract: { id: number; contractCode: string; status: string } | null;
  order: { id: number; orderCode: string; status: string } | null;
  createdAt: Date;
};
