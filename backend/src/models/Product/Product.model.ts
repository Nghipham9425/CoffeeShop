export type ProductModel = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  retailUnitName: string;
  retailUnitGram: number;
  b2bUnitName: string;
  b2bUnitGram: number;
  price: number | null;
  minimumOrderKg: number;
  imageUrl: string | null;
  isRetail: boolean;
  isB2b: boolean;
  isActive: boolean;
  stockQuantity: number;
  prices: ProductPriceModel[];
};

export type ProductPriceModel = {
  id: number;
  priceType: string;
  minQuantity: number;
  unitGram: number;
  price: number;
  startAt: Date | null;
  endAt: Date | null;
  isActive: boolean;
};
