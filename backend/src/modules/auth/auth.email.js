const fs = require("fs");
const nodemailer = require("nodemailer");
const { buildFrontendPath, getFrontendBaseUrl, normalizeBaseUrl } = require("../../config/frontend");
const {
  buildPasswordResetEmailContent,
} = require("./templates/passwordResetEmail.template");
const {
  buildVerifyEmailContent,
} = require("./templates/verifyEmail.template");

const APP_NAME = "Smart Rehab Platform";
const DEFAULT_SENDER_EMAIL = "smartrehab.ps@gmail.com";
const RESEND_API_URL = "https://api.resend.com/emails";

let transporter;

const getEmailProvider = () => {
  const raw = String(process.env.EMAIL_PROVIDER || "")
    .trim()
    .toLowerCase();
  return raw === "resend" ? "resend" : "smtp";
};

const isSmtpConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const isResendConfigured = () =>
  Boolean(
    String(process.env.RESEND_API_KEY || "").trim() &&
      String(process.env.EMAIL_FROM || "").trim(),
  );

const getResetPasswordLinkBase = () => {
  if (process.env.RESET_PASSWORD_URL) {
    return normalizeBaseUrl(process.env.RESET_PASSWORD_URL);
  }

  return `${getFrontendBaseUrl()}/reset-password`;
};

const getVerifyEmailLinkBase = () => {
  if (process.env.VERIFY_EMAIL_URL) {
    return normalizeBaseUrl(process.env.VERIFY_EMAIL_URL);
  }

  return `${getFrontendBaseUrl()}/verify-email`;
};

const buildPasswordResetLink = (token) => {
  if (process.env.RESET_PASSWORD_URL) {
    return `${getResetPasswordLinkBase()}?token=${encodeURIComponent(token)}`;
  }

  return buildFrontendPath("/reset-password", { token });
};

const buildVerificationLink = (token) => {
  if (process.env.VERIFY_EMAIL_URL) {
    return `${getVerifyEmailLinkBase()}?token=${encodeURIComponent(token)}`;
  }

  return buildFrontendPath("/verify-email", { token });
};

const getTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (transporter) {
    return transporter;
  }

  const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  };

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth,
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth,
    });
  }

  return transporter;
};

const getSender = () => {
  const emailFrom = String(process.env.EMAIL_FROM || "").trim();
  if (emailFrom) {
    if (emailFrom.includes("<")) {
      return emailFrom;
    }
    return `"${APP_NAME}" <${emailFrom}>`;
  }

  return `"${APP_NAME}" <${process.env.EMAIL_USER || DEFAULT_SENDER_EMAIL}>`;
};

const toResendAttachments = (attachments) => {
  if (!attachments?.length) {
    return undefined;
  }

  return attachments
    .map((attachment) => {
      if (!attachment?.path || !fs.existsSync(attachment.path)) {
        return null;
      }

      const payload = {
        filename: attachment.filename || "attachment",
        content: fs.readFileSync(attachment.path).toString("base64"),
      };

      if (attachment.cid) {
        payload.content_id = attachment.cid;
      }

      return payload;
    })
    .filter(Boolean);
};

const sendViaResend = async ({ to, subject, html, text, attachments }) => {
  if (!isResendConfigured()) {
    console.warn(
      "[auth.email] EMAIL_PROVIDER=resend but RESEND_API_KEY or EMAIL_FROM is missing.",
    );
    return null;
  }

  const body = {
    from: getSender(),
    to: [to],
    subject,
    html,
    text,
  };

  const resendAttachments = toResendAttachments(attachments);
  if (resendAttachments?.length) {
    body.attachments = resendAttachments;
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${String(process.env.RESEND_API_KEY).trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        detail = payload.message;
      }
    } catch {
      // keep status-only detail
    }
    throw new Error(detail);
  }

  return response.json();
};

const sendViaSmtp = async ({ to, subject, html, text, attachments }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    return null;
  }

  const mailOptions = {
    from: getSender(),
    to,
    subject,
    html,
    text,
  };

  if (attachments?.length) {
    mailOptions.attachments = attachments;
  }

  return activeTransporter.sendMail(mailOptions);
};

const sendEmail = async ({
  to,
  subject,
  html,
  text,
  fallbackLabel,
  fallbackLink,
  attachments,
}) => {
  const provider = getEmailProvider();

  try {
    if (provider === "resend") {
      const result = await sendViaResend({
        to,
        subject,
        html,
        text,
        attachments,
      });
      if (result) {
        return result;
      }
    } else {
      const result = await sendViaSmtp({
        to,
        subject,
        html,
        text,
        attachments,
      });
      if (result) {
        return result;
      }
      console.warn(
        "[auth.email] Email sending is disabled because SMTP is not configured.",
      );
    }
  } catch (error) {
    const via = provider === "resend" ? "via Resend" : "via SMTP";
    console.error(
      `[auth.email] Failed to send email ${via}:`,
      error.message || error,
    );
    throw error;
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[auth.email] Email delivery unavailable; fallback link logging is disabled in production.",
    );
  } else {
    console.info(`[auth.email] ${fallbackLabel}: ${fallbackLink}`);
  }
  return { delivered: false, fallback: true };
};

const sendPasswordResetEmail = async ({ email, fullName, resetLink }) => {
  const subject = "Reset your Smart Rehab Platform password";
  const { html, attachments } = buildPasswordResetEmailContent({
    heading: "Password Reset Request",
    preheader: "Reset your Smart Rehab Platform password.",
    greeting: `Hello ${fullName || "there"},`,
    intro:
      "We received a request to reset your Smart Rehab Platform password. Click the button below to choose a new password. This link will expire in 1 hour.",
    actionText: "Reset Password",
    actionUrl: resetLink,
    outro:
      "If you did not request a password reset, no further action is required.",
  });

  const text = `Hello ${
    fullName || "there"
  },\n\nWe received a request to reset your Smart Rehab Platform password. Use the following link to reset it (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, you can ignore this email.`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    attachments,
    fallbackLabel: `Password reset link for ${email}`,
    fallbackLink: resetLink,
  });
};

const sendEmailVerificationEmail = async ({
  email,
  fullName,
  verificationLink,
}) => {
  const subject = "Verify your Smart Rehab Platform email";
  const { html, attachments } = buildVerifyEmailContent({
    heading: "Verify Your Email Address",
    preheader: "Verify your Smart Rehab Platform email address.",
    greeting: `Hello ${fullName || "there"},`,
    intro:
      "Welcome to Smart Rehab Platform. Please verify your email address to activate your account and sign in securely.",
    actionText: "Verify Email",
    actionUrl: verificationLink,
    outro:
      "If you did not create this account, you can safely ignore this email.",
  });

  const text = `Hello ${
    fullName || "there"
  },\n\nWelcome to Smart Rehab Platform. Please verify your email address using the following link:\n${verificationLink}\n\nIf you did not create this account, you can ignore this email.`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    attachments,
    fallbackLabel: `Email verification link for ${email}`,
    fallbackLink: verificationLink,
  });
};

module.exports = {
  buildPasswordResetLink,
  buildVerificationLink,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  getEmailProvider,
  isSmtpConfigured,
  isResendConfigured,
};
