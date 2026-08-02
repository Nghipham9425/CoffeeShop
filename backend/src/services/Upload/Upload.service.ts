import { cloudinary, isCloudinaryConfigured } from "../../config/cloudinary.js";

export const uploadService = {
  uploadProductImage(file: Express.Multer.File) {
    if (!isCloudinaryConfigured) throw new Error("CLOUDINARY_NOT_CONFIGURED");

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "phu-tai-coffee/products",
          resource_type: "image",
          transformation: [
            { width: 1600, height: 1600, crop: "limit" },
            { quality: "auto:good", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Không thể tải ảnh lên Cloudinary."));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  },
};
