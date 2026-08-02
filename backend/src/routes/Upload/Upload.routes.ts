import { Router } from "express";
import multer from "multer";
import { UserRole } from "@prisma/client";
import { uploadController } from "../../controllers/Upload/Upload.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../../middleware/authMiddleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

export const uploadRoutes = Router();

uploadRoutes.post("/products", authMiddleware, authorizeRoles(UserRole.ADMIN, UserRole.SALES), upload.single("image"), asyncHandler(uploadController.uploadProductImage));
