import type { Request, Response } from "express";
import { authService } from "../../services/Auth/Auth.service.js";
import { addressSchema, changePasswordSchema, forgotPasswordSchema, googleLoginSchema, loginSchema, registerSchema, resetPasswordSchema, updateAddressSchema, updateProfileSchema } from "../../validators/Auth/Auth.validator.js";

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

  async googleLogin(req: Request, res: Response) {
    const payload = googleLoginSchema.parse(req.body);

    try {
      res.json(await authService.loginWithGoogle(payload));
    } catch (error) {
      if (error instanceof Error && error.message === "GOOGLE_AUTH_NOT_CONFIGURED") {
        res.status(503).json({ message: "Đăng nhập Google chưa được cấu hình trên máy chủ." });
        return;
      }
      if (error instanceof Error && error.message === "ACCOUNT_DISABLED") {
        res.status(403).json({ message: "Tài khoản đã bị khóa." });
        return;
      }
      if (error instanceof Error && error.message === "INVALID_GOOGLE_CREDENTIAL") {
        res.status(401).json({ message: "Thông tin đăng nhập Google không hợp lệ hoặc đã hết hạn." });
        return;
      }
      throw error;
    }
  },

  async forgotPassword(req: Request, res: Response) {
    const payload = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(payload);
    res.json({
      message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
    });
  },

  async resetPassword(req: Request, res: Response) {
    const payload = resetPasswordSchema.parse(req.body);

    try {
      await authService.resetPassword(payload);
      res.json({ message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_RESET_TOKEN") {
        res.status(400).json({
          message: "Liên kết đặt lại mật khẩu không hợp lệ, đã hết hạn hoặc đã được sử dụng.",
        });
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
