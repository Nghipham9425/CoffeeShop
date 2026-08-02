import type { Request, Response } from "express";
import { notificationService } from "../../services/Notification/Notification.service.js";

export const notificationController = {
  async listMine(req: Request, res: Response) { res.json(await notificationService.listForUser(req.user!.userId)); },
  async markRead(req: Request, res: Response) {
    try { await notificationService.markRead(Number(req.params.id), req.user!.userId); res.status(204).send(); }
    catch (error) {
      if (error instanceof Error && error.message === "NOTIFICATION_NOT_FOUND") { res.status(404).json({ message: "Không tìm thấy thông báo." }); return; }
      throw error;
    }
  },
  async markAllRead(req: Request, res: Response) { await notificationService.markAllRead(req.user!.userId); res.status(204).send(); },
};
