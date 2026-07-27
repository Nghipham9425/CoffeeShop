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
    res.status(500).json({
      message: "Máy chủ đang gặp lỗi.",
      detail: isDevelopment ? error.message : undefined,
    });
    return;
  }

  res.status(500).json({ message: "Máy chủ đang gặp lỗi." });
}
