import type { Request, Response } from "express";
import { productService } from "../../services/Product/Product.service.js";
import {
  createProductPriceSchema,
  createProductSchema,
  productQuerySchema,
  updateProductSchema,
} from "../../validators/Product/Product.validator.js";

export const productController = {
  async getProducts(req: Request, res: Response) {
    const query = productQuerySchema.parse(req.query);
    const products = await productService.getProducts(query);
    res.json(products);
  },

  async getAdminProducts(req: Request, res: Response) {
    res.json(await productService.getAdminProducts(productQuerySchema.parse(req.query)));
  },

  async getProductById(req: Request, res: Response) {
    const product = await productService.getProductById(Number(req.params.id));

    if (!product) {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    res.json(product);
  },

  async getProductBySlug(req: Request, res: Response) {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const product = await productService.getProductBySlug(slug);

    if (!product) {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    res.json(product);
  },

  async getProductPrices(req: Request, res: Response) {
    try {
      res.json(await productService.getProductPrices(Number(req.params.id)));
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        return;
      }
      throw error;
    }
  },

  async createProduct(req: Request, res: Response) {
    const payload = createProductSchema.parse(req.body);

    try {
      const product = await productService.createProduct(payload);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy danh mục sản phẩm" });
        return;
      }

      throw error;
    }
  },

  async updateProduct(req: Request, res: Response) {
    const productId = Number(req.params.id);
    const payload = updateProductSchema.parse(req.body);

    try {
      const product = await productService.updateProduct(productId, payload, req.user?.userId);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        return;
      }

      if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy danh mục sản phẩm" });
        return;
      }

      throw error;
    }
  },

  async deleteProduct(req: Request, res: Response) {
    const productId = Number(req.params.id);

    try {
      await productService.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        return;
      }

      throw error;
    }
  },

  async addProductPrice(req: Request, res: Response) {
    const productId = Number(req.params.id);
    const payload = createProductPriceSchema.parse(req.body);

    try {
      const price = await productService.addProductPrice(productId, payload, req.user?.userId);
      res.status(201).json(price);
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        return;
      }

      if (error instanceof Error && error.message === "INVALID_PRICE_DATE_RANGE") {
        res.status(400).json({ message: "Ngày kết thúc phải lớn hơn ngày bắt đầu" });
        return;
      }

      throw error;
    }
  },

  async getPriceHistory(req: Request, res: Response) {
    try {
      res.json(await productService.getPriceHistory(Number(req.params.id)));
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        return;
      }
      throw error;
    }
  },
};
