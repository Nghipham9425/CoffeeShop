import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

function createTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

export const mailService = {
  async sendPasswordResetEmail(input: { email: string; fullName: string; resetUrl: string }) {
    const transporter = createTransporter();
    const expiresIn = env.resetPasswordExpiresMinutes;

    await transporter.sendMail({
      from: env.mailFrom || `Phú Tài Coffee Works <${env.smtpUser}>`,
      to: input.email,
      subject: "Đặt lại mật khẩu - Phú Tài Coffee Works",
      text: [
        `Xin chào ${input.fullName},`,
        "",
        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.",
        `Mở liên kết sau để tạo mật khẩu mới: ${input.resetUrl}`,
        "",
        `Liên kết có hiệu lực trong ${expiresIn} phút và chỉ sử dụng được một lần.`,
        "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.",
      ].join("\n"),
      html: `
        <div style="background:#faf7f0;padding:32px 16px;font-family:Arial,sans-serif;color:#2a1510">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7dccb;padding:32px">
            <p style="margin:0 0 8px;color:#8a4a2f;font-size:12px;font-weight:700;text-transform:uppercase">
              Phú Tài Coffee Works
            </p>
            <h1 style="margin:0 0 20px;font-size:26px">Đặt lại mật khẩu</h1>
            <p style="line-height:1.7">Xin chào <strong>${escapeHtml(input.fullName)}</strong>,</p>
            <p style="line-height:1.7">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
              Nhấn nút bên dưới để tạo mật khẩu mới.
            </p>
            <p style="margin:28px 0">
              <a href="${input.resetUrl}" style="display:inline-block;background:#4b2418;color:#fff;padding:13px 22px;text-decoration:none;font-weight:700">
                Đặt lại mật khẩu
              </a>
            </p>
            <p style="line-height:1.7;color:#6a554a">
              Liên kết có hiệu lực trong ${expiresIn} phút và chỉ sử dụng được một lần.
              Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.
            </p>
          </div>
        </div>
      `,
    });
  },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}
