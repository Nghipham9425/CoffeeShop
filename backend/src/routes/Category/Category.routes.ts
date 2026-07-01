import { Router } from "express";
import { UserRole } from "@prisma/client";
import { categoryController } from "../../controllers/Category/Category.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", asyncHandler(categoryController.getCategories));
categoryRoutes.get("/:id", asyncHandler(categoryController.getCategoryById));
categoryRoutes.post(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(categoryController.createCategory),
);
categoryRoutes.patch(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(categoryController.updateCategory),
);
categoryRoutes.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(categoryController.deleteCategory),
);
