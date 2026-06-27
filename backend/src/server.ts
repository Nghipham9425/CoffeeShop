import { env } from "./config/env.js";
import { prisma } from "./data/prisma.js";
import { app } from "./app.js";

const server = app.listen(env.port, () => {
  console.log(`API dang chay tai http://localhost:${env.port}`);
});

async function shutdown(signal: string) {
  console.log(`Nhan ${signal}, dang tat server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
