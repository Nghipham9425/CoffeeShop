import { Router } from "express";
import { UserRole } from "@prisma/client";
import { productController } from "../../controllers/Product/Product.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const productRoutes = Router();

productRoutes.get("/", asyncHandler(productController.getProducts));
productRoutes.get("/:id", asyncHandler(productController.getProductById));
productRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(productController.createProduct),
);
productRoutes.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(productController.updateProduct),
);
productRoutes.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(productController.deleteProduct),
);
productRoutes.post(
  "/:id/prices",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(productController.addProductPrice),
);
