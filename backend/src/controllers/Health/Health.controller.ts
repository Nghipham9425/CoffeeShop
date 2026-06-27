import type { Request, Response } from "express";
import { healthService } from "../../services/Health/Health.service.js";

export const healthController = {
  async getHealth(_req: Request, res: Response) {
    const status = await healthService.getStatus();
    res.json(status);
  },
};
