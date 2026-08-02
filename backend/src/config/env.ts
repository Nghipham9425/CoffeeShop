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
  sepayEnvironment: (process.env.SEPAY_ENV?.trim().toLowerCase() === "production" ? "production" : "sandbox") as "sandbox" | "production",
  sepayMerchantId: process.env.SEPAY_MERCHANT_ID?.trim(),
  sepaySecretKey: process.env.SEPAY_SECRET_KEY?.trim(),
  clientAppUrl: process.env.CLIENT_APP_URL?.trim() ?? (clientOrigins[0] ?? "http://localhost:3000"),
  sepayPaymentExpiryMinutes: Number(process.env.SEPAY_PAYMENT_EXPIRY_MINUTES ?? 30),
  smtpHost: process.env.SMTP_HOST?.trim(),
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER?.trim(),
  smtpPass: process.env.SMTP_PASS?.trim(),
  mailFrom: process.env.MAIL_FROM?.trim(),
  resendApiKey: process.env.RESEND_API_KEY?.trim(),
  resendFrom: process.env.RESEND_FROM?.trim(),
  brevoApiKey: process.env.BREVO_API_KEY?.trim(),
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL?.trim(),
  brevoSenderName: process.env.BREVO_SENDER_NAME?.trim() ?? "Phu Tai Coffee Works",
  resetPasswordExpiresMinutes: Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES ?? 30),
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim(),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim(),
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET?.trim(),
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() ?? "",
};

export const isDevelopment = env.nodeEnv === "development";
