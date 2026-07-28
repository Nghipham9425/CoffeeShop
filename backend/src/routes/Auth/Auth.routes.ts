import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../../controllers/Auth/Auth.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

export const authRoutes = Router();

const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút." },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Bạn đã thử đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau." },
});

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.post("/forgot-password", passwordResetRequestLimiter, asyncHandler(authController.forgotPassword));
authRoutes.post("/reset-password", passwordResetLimiter, asyncHandler(authController.resetPassword));
authRoutes.get("/me", authMiddleware, asyncHandler(authController.me));
authRoutes.patch("/me", authMiddleware, asyncHandler(authController.updateMe));
authRoutes.patch("/me/password", authMiddleware, asyncHandler(authController.changePassword));
authRoutes.get("/me/addresses", authMiddleware, asyncHandler(authController.addresses));
authRoutes.post("/me/addresses", authMiddleware, asyncHandler(authController.createAddress));
authRoutes.patch("/me/addresses/:addressId", authMiddleware, asyncHandler(authController.updateAddress));
authRoutes.delete("/me/addresses/:addressId", authMiddleware, asyncHandler(authController.deleteAddress));
authRoutes.get("/me/orders", authMiddleware, asyncHandler(authController.orderHistory));
