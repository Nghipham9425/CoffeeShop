import type { Request, Response } from "express";
import { authService } from "../../services/Auth/Auth.service.js";
import { loginSchema, registerSchema } from "../../validators/Auth/Auth.validator.js";

export const authController = {
  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body);

    try {
      const result = await authService.register(payload);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({ message: "Email da ton tai" });
        return;
      }

      throw error;
    }
  },

  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);

    try {
      const result = await authService.login(payload);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ message: "Email hoac mat khau khong dung" });
        return;
      }

      throw error;
    }
  },
};
