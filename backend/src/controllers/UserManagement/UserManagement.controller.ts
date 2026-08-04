import type { Request, Response } from "express";
import { userManagementService } from "../../services/UserManagement/UserManagement.service.js";
import { updateUserActiveSchema, updateUserRoleSchema, userManagementQuerySchema } from "../../validators/UserManagement/UserManagement.validator.js";

function sendKnownError(res: Response, error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "USER_NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy người dùng." });
  if (code === "CANNOT_CHANGE_OWN_ROLE") return res.status(400).json({ message: "Không thể tự thay đổi vai trò của chính mình." });
  if (code === "CANNOT_CHANGE_OWN_STATUS") return res.status(400).json({ message: "Không thể tự khóa tài khoản của chính mình." });
  if (code === "LAST_ACTIVE_ADMIN") return res.status(409).json({ message: "Phải luôn còn ít nhất một quản trị viên đang hoạt động." });
  return false;
}

export const userManagementController = {
  async list(req: Request, res: Response) {
    res.json(await userManagementService.list(userManagementQuerySchema.parse(req.query)));
  },
  async updateRole(req: Request, res: Response) {
    try {
      res.json(await userManagementService.changeRole(req.user!.userId, Number(req.params.id), updateUserRoleSchema.parse(req.body).role));
    } catch (error) {
      if (sendKnownError(res, error)) return;
      throw error;
    }
  },
  async updateActive(req: Request, res: Response) {
    try {
      res.json(await userManagementService.changeActive(req.user!.userId, Number(req.params.id), updateUserActiveSchema.parse(req.body).isActive));
    } catch (error) {
      if (sendKnownError(res, error)) return;
      throw error;
    }
  },
};
