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

let transporter;

const isSmtpConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

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
    pass: process.env.EMAIL_PASSWORD
  };

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth
    });
  }

  return transporter;
};

const getSender = () =>
  `"${APP_NAME}" <${process.env.EMAIL_USER || DEFAULT_SENDER_EMAIL}>`;

const sendEmail = async ({
  to,
  subject,
  html,
  text,
  fallbackLabel,
  fallbackLink,
  attachments
}) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    console.warn(
      "[auth.email] Email sending is disabled because SMTP is not configured."
    );
    console.info(`[auth.email] ${fallbackLabel}: ${fallbackLink}`);
    return { delivered: false, fallback: true };
  }

  const mailOptions = {
    from: getSender(),
    to,
    subject,
    html,
    text
  };

  if (attachments?.length) {
    mailOptions.attachments = attachments;
  }

  return activeTransporter.sendMail(mailOptions);
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
      "If you did not request a password reset, no further action is required."
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
    fallbackLink: resetLink
  });
};

const sendEmailVerificationEmail = async ({
  email,
  fullName,
  verificationLink
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
      "If you did not create this account, you can safely ignore this email."
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
    fallbackLink: verificationLink
  });
};

module.exports = {
  buildPasswordResetLink,
  buildVerificationLink,
  sendPasswordResetEmail,
  sendEmailVerificationEmail
};
