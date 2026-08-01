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
    price: product.price ? Number(product.price) : null,
    minimumOrderKg: product.minimumOrderKg,
    imageUrl: product.imageUrl,
    isRetail: product.isRetail,
    isB2b: product.isB2b,
    prices: product.prices.map((price) => ({
      id: price.id,
      priceType: price.priceType,
      minQuantity: price.minQuantity,
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
    const products = await productData.findMany(query);
    return products.map(mapProduct);
  },

  async getProductById(id: number) {
    const product = await productData.findById(id);
    return product ? mapProduct(product) : null;
  },

  async createProduct(input: CreateProductInput) {
    await ensureCategoryExists(input.categoryId);
    const slug = await buildUniqueSlug(input.name, input.slug);
    const product = await productData.create({ ...input, slug });
    return mapProduct(product);
  },

  async updateProduct(id: number, input: UpdateProductInput) {
    const existingProduct = await productData.findById(id);
    if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");
    if (input.categoryId) await ensureCategoryExists(input.categoryId);

    const slug = input.name || input.slug
      ? await buildUniqueSlug(input.name ?? existingProduct.name, input.slug, id)
      : undefined;

    const product = await productData.update(id, { ...input, slug });
    return mapProduct(product);
  },

  async deleteProduct(id: number) {
    const existingProduct = await productData.findById(id);
    if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");
    await productData.softDelete(id);
  },

  async addProductPrice(productId: number, input: CreateProductPriceInput) {
    const existingProduct = await productData.findById(productId);
    if (!existingProduct) throw new Error("PRODUCT_NOT_FOUND");
    if (input.startAt && input.endAt && input.endAt < input.startAt) {
      throw new Error("INVALID_PRICE_DATE_RANGE");
    }

    const price = await productData.upsertPrice(productId, input);
    return {
      id: price.id,
      productId: price.productId,
      priceType: price.priceType,
      minQuantity: price.minQuantity,
      price: Number(price.price),
      startAt: price.startAt,
      endAt: price.endAt,
      isActive: price.isActive,
    };
  },
};