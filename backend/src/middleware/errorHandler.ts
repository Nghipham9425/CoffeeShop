import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isDevelopment } from "../config/env.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Dữ liệu gửi lên không hợp lệ.",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof Error) {
    if (error.message === "MAIL_DELIVERY_FAILED" || error.message === "SMTP_NOT_CONFIGURED") {
      res.status(503).json({
        message: "Dá»‹ch vá»¥ gá»­i email Ä‘ang táº¡m thá»i khÃ´ng kháº£ dá»¥ng. Vui lÃ²ng thá»­ láº¡i sau.",
      });
      return;
    }

    res.status(500).json({
      message: "Máy chủ đang gặp lỗi.",
      detail: isDevelopment ? error.message : undefined,
    });
    return;
  }

  res.status(500).json({ message: "Máy chủ đang gặp lỗi." });
}
