import { UserRole } from "@prisma/client";
import { Router } from "express";
import { userManagementController } from "../../controllers/UserManagement/UserManagement.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const userManagementRoutes = Router();
userManagementRoutes.use(authMiddleware, authorizeRoles(UserRole.ADMIN));
userManagementRoutes.get("/", asyncHandler(userManagementController.list));
userManagementRoutes.patch("/:id/role", asyncHandler(userManagementController.updateRole));
userManagementRoutes.patch("/:id/active", asyncHandler(userManagementController.updateActive));
