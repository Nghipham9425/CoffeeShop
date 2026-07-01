export type ProductModel = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  price: number | null;
  minimumOrderKg: number;
  imageUrl: string | null;
  isRetail: boolean;
  isB2b: boolean;
  prices: ProductPriceModel[];
};

export type ProductPriceModel = {
  id: number;
  priceType: string;
  minQuantity: number;
  price: number;
  startAt: Date | null;
  endAt: Date | null;
  isActive: boolean;
};
