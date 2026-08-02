import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "../../config/env.js";

type PasswordResetEmail = { email: string; fullName: string; resetUrl: string };

type MailMessage = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

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

function createPasswordResetMessage(input: PasswordResetEmail): MailMessage {
  const expiresIn = env.resetPasswordExpiresMinutes;
  const from = env.resendFrom || env.mailFrom || `Phu Tai Coffee Works <${env.smtpUser}>`;

  return {
    from,
    to: input.email,
    subject: "\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u - Ph\u00fa T\u00e0i Coffee Works",
    text: [
      `Xin ch\u00e0o ${input.fullName},`,
      "",
      "Ch\u00fang t\u00f4i nh\u1eadn \u0111\u01b0\u1ee3c y\u00eau c\u1ea7u \u0111\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u cho t\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n.",
      `M\u1edf li\u00ean k\u1ebft sau \u0111\u1ec3 t\u1ea1o m\u1eadt kh\u1ea9u m\u1edbi: ${input.resetUrl}`,
      "",
      `Li\u00ean k\u1ebft c\u00f3 hi\u1ec7u l\u1ef1c trong ${expiresIn} ph\u00fat v\u00e0 ch\u1ec9 s\u1eed d\u1ee5ng \u0111\u01b0\u1ee3c m\u1ed9t l\u1ea7n.`,
      "N\u1ebfu b\u1ea1n kh\u00f4ng th\u1ef1c hi\u1ec7n y\u00eau c\u1ea7u n\u00e0y, h\u00e3y b\u1ecf qua email.",
    ].join("\n"),
    html: `
      <div style="background:#faf7f0;padding:32px 16px;font-family:Arial,sans-serif;color:#2a1510">
        <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7dccb;padding:32px">
          <p style="margin:0 0 8px;color:#8a4a2f;font-size:12px;font-weight:700;text-transform:uppercase">Ph\u00fa T\u00e0i Coffee Works</p>
          <h1 style="margin:0 0 20px;font-size:26px">\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u</h1>
          <p style="line-height:1.7">Xin ch\u00e0o <strong>${escapeHtml(input.fullName)}</strong>,</p>
          <p style="line-height:1.7">Ch\u00fang t\u00f4i nh\u1eadn \u0111\u01b0\u1ee3c y\u00eau c\u1ea7u \u0111\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u cho t\u00e0i kho\u1ea3n c\u1ee7a b\u1ea1n. Nh\u1ea5n n\u00fat b\u00ean d\u01b0\u1edbi \u0111\u1ec3 t\u1ea1o m\u1eadt kh\u1ea9u m\u1edbi.</p>
          <p style="margin:28px 0"><a href="${input.resetUrl}" style="display:inline-block;background:#4b2418;color:#fff;padding:13px 22px;text-decoration:none;font-weight:700">\u0110\u1eb7t l\u1ea1i m\u1eadt kh\u1ea9u</a></p>
          <p style="line-height:1.7;color:#6a554a">Li\u00ean k\u1ebft c\u00f3 hi\u1ec7u l\u1ef1c trong ${expiresIn} ph\u00fat v\u00e0 ch\u1ec9 s\u1eed d\u1ee5ng \u0111\u01b0\u1ee3c m\u1ed9t l\u1ea7n. N\u1ebfu b\u1ea1n kh\u00f4ng th\u1ef1c hi\u1ec7n y\u00eau c\u1ea7u n\u00e0y, h\u00e3y b\u1ecf qua email.</p>
        </div>
      </div>
    `,
  };
}

async function sendWithBrevo(message: MailMessage) {
  if (!env.brevoApiKey || !env.brevoSenderEmail) {
    throw new Error("BREVO_NOT_CONFIGURED");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": env.brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
      to: [{ email: message.to }],
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`BREVO_SEND_FAILED:${response.status}:${detail}`);
  }
}

export const mailService = {
  async sendPasswordResetEmail(input: PasswordResetEmail) {
    const message = createPasswordResetMessage(input);

    if (env.brevoApiKey) {
      await sendWithBrevo(message);
      return;
    }

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
