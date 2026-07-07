import type { Request, Response } from "express";
import { reportService } from "../../services/Report/Report.service.js";

export const reportController = {
  async getOverview(_req: Request, res: Response) {
    res.json(await reportService.getOverview());
  },
};
