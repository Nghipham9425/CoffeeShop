import { Router } from "express";
import { UserRole } from "@prisma/client";
import { reportController } from "../../controllers/Report/Report.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const reportRoutes = Router();

reportRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTANT));
reportRoutes.get("/overview", asyncHandler(reportController.getOverview));
