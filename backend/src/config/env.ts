import "dotenv/config";

const defaultClientOrigins = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173";
const clientOrigins = (process.env.CLIENT_ORIGINS ?? process.env.CLIENT_ORIGIN ?? defaultClientOrigins)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  clientOrigin: clientOrigins[0] ?? "http://localhost:5173",
  clientOrigins,
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/coffee_b2b?schema=public",
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
};

export const isDevelopment = env.nodeEnv === "development";
