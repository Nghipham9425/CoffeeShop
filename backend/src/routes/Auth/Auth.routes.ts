import { Router } from "express";
import { authController } from "../../controllers/Auth/Auth.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
