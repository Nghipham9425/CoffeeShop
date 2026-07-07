import { Router } from "express";
import { UserRole } from "@prisma/client";
import { customerController } from "../../controllers/Customer/Customer.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const customerRoutes = Router();

customerRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES));
customerRoutes.get("/retail", asyncHandler(customerController.getRetailCustomers));
customerRoutes.patch("/retail/:id", asyncHandler(customerController.updateRetailCustomer));
customerRoutes.get("/business", asyncHandler(customerController.getBusinessCustomers));
customerRoutes.post("/business", asyncHandler(customerController.createBusinessCustomer));
customerRoutes.patch("/business/:id", asyncHandler(customerController.updateBusinessCustomer));
