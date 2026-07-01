import { Router } from "express";
import { UserRole } from "@prisma/client";
import { contactMessageController } from "../../controllers/ContactMessage/ContactMessage.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

export const contactMessageRoutes = Router();

contactMessageRoutes.post("/", asyncHandler(contactMessageController.createContactMessage));
contactMessageRoutes.get(
  "/",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(contactMessageController.getContactMessages),
);
contactMessageRoutes.get(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(contactMessageController.getContactMessageById),
);
contactMessageRoutes.patch(
  "/:id/read-status",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN, UserRole.SALES),
  asyncHandler(contactMessageController.updateReadStatus),
);
contactMessageRoutes.delete(
  "/:id",
  authMiddleware,
  authorizeRoles(UserRole.ADMIN),
  asyncHandler(contactMessageController.deleteContactMessage),
);
