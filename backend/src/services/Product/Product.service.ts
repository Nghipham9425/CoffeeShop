import { productData } from "../../data/Product/Product.data.js";
import type { ProductModel } from "../../models/Product/Product.model.js";
import type { ProductQueryInput } from "../../validators/Product/Product.validator.js";

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
  };
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
};
