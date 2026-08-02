import { productData } from "../../data/Product/Product.data.js";
import type { ProductModel } from "../../models/Product/Product.model.js";
import { slugify } from "../../utils/slugify.js";
import type {
  CreateProductInput,
  CreateProductPriceInput,
  ProductQueryInput,
  UpdateProductInput,
} from "../../validators/Product/Product.validator.js";

type ProductRecord = Awaited<ReturnType<typeof productData.findMany>>[number];

function mapProduct(product: ProductRecord): ProductModel {
  return {
    id: product.id,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    name: product.name,
    slug: product.slug,
    description: product.description,
    unit: product.unit,
    retailUnitName: product.retailUnitName,
    retailUnitGram: product.retailUnitGram,
    b2bUnitName: product.b2bUnitName,
    b2bUnitGram: product.b2bUnitGram,
    price: (() => {
      const retail = product.prices.find((item) => item.priceType === "RETAIL" && item.minQuantity === 1);
      return retail ? Number(retail.price) : null;
    })(),
    minimumOrderKg: product.minimumOrderKg,
    imageUrl: product.imageUrl,
    isRetail: product.isRetail,
    isB2b: product.isB2b,
    isActive: product.isActive,
    // Tồn kho luôn lưu bằng gram.
    stockQuantity: product.inventories.reduce((total, inventory) => total + inventory.quantity, 0),
    prices: product.prices.map((price) => ({
      id: price.id,
      priceType: price.priceType,
      minQuantity: price.minQuantity,
      unitGram: price.unitGram,
      price: Number(price.price),
      startAt: price.startAt,
      endAt: price.endAt,
      isActive: price.isActive,
    })),
  };
}

async function ensureCategoryExists(categoryId: number) {
  const category = await productData.findCategoryById(categoryId);
  if (!category) throw new Error("CATEGORY_NOT_FOUND");
}

async function buildUniqueSlug(name: string, preferredSlug?: string, currentProductId?: number) {
  const baseSlug = slugify(preferredSlug ?? name);
  let slug = baseSlug;
  let suffix = 1;
  while (true) {
    const existingProduct = await productData.findBySlug(slug);
    if (!existingProduct || existingProduct.id === currentProductId) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export const productService = {
  async getProducts(query: ProductQueryInput) {
    return (await productData.findMany({ ...query, isRetail: query.isRetail ?? true })).map(mapProduct);
  },

  async getProductById(id: number) {
    const product = await productData.findById(id);
    return product ? mapProduct(product) : null;
  },

  async getAdminProducts(query: ProductQueryInput) {
    return (await productData.findMany(query, true)).map(mapProduct);
  },

  async getProductBySlug(slug: string) {
    const product = await productData.findBySlug(slug);
    return product ? mapProduct(product) : null;
  },

  async getProductPrices(productId: number) {
    const product = await productData.findById(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product.prices.map((price) => ({
      id: price.id,
      productId: price.productId,
      priceType: price.priceType,
      minQuantity: price.minQuantity,
      unitGram: price.unitGram,
      price: Number(price.price),
      startAt: price.startAt,
      endAt: price.endAt,
      isActive: price.isActive,
    }));
  },

  async createProduct(input: CreateProductInput) {
    await ensureCategoryExists(input.categoryId);
    const slug = await buildUniqueSlug(input.name, input.slug);
    return mapProduct(await productData.create({ ...input, slug }));
  },

  async updateProduct(id: number, input: UpdateProductInput, createdById?: number) {
    const existingProduct = await productData.findAnyById(id);
    if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");
    if (input.categoryId) await ensureCategoryExists(input.categoryId);
    const slug = input.name || input.slug
      ? await buildUniqueSlug(input.name ?? existingProduct.name, input.slug, id)
      : undefined;
    return mapProduct(await productData.update(id, { ...input, slug }, createdById));
  },

  async deleteProduct(id: number) {
    const existingProduct = await productData.findAnyById(id);
    if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");
    await productData.softDelete(id);
  },

  async addProductPrice(productId: number, input: CreateProductPriceInput, createdById?: number) {
    const product = await productData.findById(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (input.startAt && input.endAt && input.endAt < input.startAt) throw new Error("INVALID_PRICE_DATE_RANGE");

    const unitGram = input.priceType === "RETAIL" ? product.retailUnitGram : product.b2bUnitGram;
    const price = await productData.upsertPrice(productId, { ...input, unitGram }, createdById);
    return {
      id: price.id,
      productId: price.productId,
      priceType: price.priceType,
      minQuantity: price.minQuantity,
      unitGram: price.unitGram,
      price: Number(price.price),
      startAt: price.startAt,
      endAt: price.endAt,
      isActive: price.isActive,
    };
  },

  async getPriceHistory(productId: number) {
    const product = await productData.findAnyById(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return (await productData.findPriceHistory(productId)).map((item) => ({
      ...item,
      oldPrice: item.oldPrice === null ? null : Number(item.oldPrice),
      newPrice: Number(item.newPrice),
    }));
  },
};
