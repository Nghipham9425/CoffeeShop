import type { Request, Response } from "express";
import { uploadService } from "../../services/Upload/Upload.service.js";

export const uploadController = {
  async uploadProductImage(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ message: "Vui lòng chọn một tệp ảnh để tải lên." });
      return;
    }
    if (!req.file.mimetype.startsWith("image/")) {
      res.status(400).json({ message: "Chỉ hỗ trợ tệp hình ảnh." });
      return;
    }
    try {
      res.status(201).json(await uploadService.uploadProductImage(req.file));
    } catch (error) {
      if (error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED") {
        res.status(503).json({ message: "Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET vào .env." });
        return;
      }
      throw error;
    }
  },
};
