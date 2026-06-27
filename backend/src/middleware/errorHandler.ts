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
      message: "Du lieu gui len khong hop le",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({
      message: "May chu dang gap loi",
      detail: isDevelopment ? error.message : undefined,
    });
    return;
  }

  res.status(500).json({ message: "May chu dang gap loi" });
}
