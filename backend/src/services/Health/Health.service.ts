import { prisma } from "../../data/prisma.js";

export const healthService = {
  async getStatus() {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    };
  },
};
