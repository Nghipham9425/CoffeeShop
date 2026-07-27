import { Router } from "express";
import { authController } from "../../controllers/Auth/Auth.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.get("/me", authMiddleware, asyncHandler(authController.me));
authRoutes.patch("/me", authMiddleware, asyncHandler(authController.updateMe));
authRoutes.patch("/me/password", authMiddleware, asyncHandler(authController.changePassword));
authRoutes.get("/me/addresses", authMiddleware, asyncHandler(authController.addresses));
authRoutes.post("/me/addresses", authMiddleware, asyncHandler(authController.createAddress));
authRoutes.patch("/me/addresses/:addressId", authMiddleware, asyncHandler(authController.updateAddress));
authRoutes.delete("/me/addresses/:addressId", authMiddleware, asyncHandler(authController.deleteAddress));
authRoutes.get("/me/orders", authMiddleware, asyncHandler(authController.orderHistory));
