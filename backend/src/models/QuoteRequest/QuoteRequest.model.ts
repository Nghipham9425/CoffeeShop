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
  createdAt: Date;
};
