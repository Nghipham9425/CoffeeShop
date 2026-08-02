import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../../config/env.js";

type PasswordResetEmail = { email: string; fullName: string; resetUrl: string };

function createTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
}

function createPasswordResetMessage(input: PasswordResetEmail) {
  const expiresIn = env.resetPasswordExpiresMinutes;
  const from = env.resendFrom || env.mailFrom || `Phu Tai Coffee Works <${env.smtpUser}>`;

  return {
    from,
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
          <p style="margin:0 0 8px;color:#8a4a2f;font-size:12px;font-weight:700;text-transform:uppercase">Phú Tài Coffee Works</p>
          <h1 style="margin:0 0 20px;font-size:26px">Đặt lại mật khẩu</h1>
          <p style="line-height:1.7">Xin chào <strong>${escapeHtml(input.fullName)}</strong>,</p>
          <p style="line-height:1.7">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tạo mật khẩu mới.</p>
          <p style="margin:28px 0"><a href="${input.resetUrl}" style="display:inline-block;background:#4b2418;color:#fff;padding:13px 22px;text-decoration:none;font-weight:700">Đặt lại mật khẩu</a></p>
          <p style="line-height:1.7;color:#6a554a">Liên kết có hiệu lực trong ${expiresIn} phút và chỉ sử dụng được một lần. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.</p>
        </div>
      </div>
    `,
  };
}

export const mailService = {
  async sendPasswordResetEmail(input: PasswordResetEmail) {
    const message = createPasswordResetMessage(input);

    if (env.resendApiKey) {
      const resend = new Resend(env.resendApiKey);
      const { error } = await resend.emails.send({ ...message, to: [message.to] });
      if (error) throw new Error(`RESEND_SEND_FAILED:${error.message}`);
      return;
    }

    const transporter = createTransporter();
    await transporter.sendMail(message);
  },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[character];
  });
}
