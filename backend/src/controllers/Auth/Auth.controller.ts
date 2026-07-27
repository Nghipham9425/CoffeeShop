import type { Request, Response } from "express";
import { authService } from "../../services/Auth/Auth.service.js";
import { addressSchema, changePasswordSchema, loginSchema, registerSchema, updateAddressSchema, updateProfileSchema } from "../../validators/Auth/Auth.validator.js";

export const authController = {
  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body);

    try {
      const result = await authService.register(payload);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({ message: "Email đã tồn tại" });
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
        res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        return;
      }

      throw error;
    }
  },

  async me(req: Request, res: Response) {
    const profile = await authService.profile(req.user!.userId);
    res.json(profile);
  },

  async updateMe(req: Request, res: Response) {
    const payload = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user!.userId, payload);
    res.json(user);
  },

  async changePassword(req: Request, res: Response) {
    const payload = changePasswordSchema.parse(req.body);

    try {
      await authService.changePassword(req.user!.userId, payload);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_CURRENT_PASSWORD") {
        res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        return;
      }
      throw error;
    }
  },

  async addresses(req: Request, res: Response) {
    res.json(await authService.listAddresses(req.user!.userId));
  },

  async createAddress(req: Request, res: Response) {
    const payload = addressSchema.parse(req.body);
    res.status(201).json(await authService.createAddress(req.user!.userId, payload));
  },

  async updateAddress(req: Request, res: Response) {
    const payload = updateAddressSchema.parse(req.body);
    const address = await authService.updateAddress(req.user!.userId, Number(req.params.addressId), payload);
    if (!address) {
      res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      return;
    }
    res.json(address);
  },

  async deleteAddress(req: Request, res: Response) {
    const deleted = await authService.deleteAddress(req.user!.userId, Number(req.params.addressId));
    if (!deleted) {
      res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      return;
    }
    res.status(204).send();
  },

  async orderHistory(req: Request, res: Response) {
    res.json(await authService.orderHistory(req.user!.userId));
  },
};
