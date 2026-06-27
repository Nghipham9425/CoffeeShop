import { Router } from "express";
import { productController } from "../../controllers/Product/Product.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const productRoutes = Router();

productRoutes.get("/", asyncHandler(productController.getProducts));
productRoutes.get("/:id", asyncHandler(productController.getProductById));
