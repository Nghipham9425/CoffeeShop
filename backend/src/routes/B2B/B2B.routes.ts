import { Router } from "express";
import { UserRole } from "@prisma/client";
import { b2bController } from "../../controllers/B2B/B2B.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const b2bRoutes = Router();
b2bRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTANT));
b2bRoutes.get("/", asyncHandler(b2bController.list));
b2bRoutes.patch("/contracts/:id", asyncHandler(b2bController.updateContract));
b2bRoutes.post("/invoices", asyncHandler(b2bController.createInvoice));
b2bRoutes.post("/debts/:id/payments", asyncHandler(b2bController.recordDebtPayment));
