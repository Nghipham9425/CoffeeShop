import type { Request, Response } from "express";
import { productService } from "../../services/Product/Product.service.js";
import { productQuerySchema } from "../../validators/Product/Product.validator.js";

export const productController = {
  async getProducts(req: Request, res: Response) {
    const query = productQuerySchema.parse(req.query);
    const products = await productService.getProducts(query);
    res.json(products);
  },

  async getProductById(req: Request, res: Response) {
    const product = await productService.getProductById(Number(req.params.id));

    if (!product) {
      res.status(404).json({ message: "Khong tim thay san pham" });
      return;
    }

    res.json(product);
  },
};
