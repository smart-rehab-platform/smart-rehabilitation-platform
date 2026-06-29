const nodemailer = require("nodemailer");

const APP_NAME = "Smart Rehab Platform";
const DEFAULT_SENDER_EMAIL = "smartrehab.ps@gmail.com";

let transporter;

const isSmtpConfigured = () =>
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const getApiBaseUrl = () =>
  process.env.API_BASE_URL ||
  `http://localhost:${process.env.PORT || 5000}/api/v1`;

const getFrontendBaseUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:3000";

const getResetPasswordBaseUrl = () =>
  process.env.RESET_PASSWORD_URL || `${getFrontendBaseUrl()}/reset-password`;

const getVerifyEmailBaseUrl = () =>
  process.env.VERIFY_EMAIL_URL ||
  `${getApiBaseUrl()}/auth/verify-email`;

const buildPasswordResetLink = (token) =>
  `${getResetPasswordBaseUrl()}?token=${encodeURIComponent(token)}`;

const buildVerificationLink = (token) =>
  `${getVerifyEmailBaseUrl()}?token=${encodeURIComponent(token)}`;

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

const renderEmailTemplate = ({
  heading,
  preheader,
  greeting,
  intro,
  actionText,
  actionUrl,
  outro
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0A1931;font-family:Arial,sans-serif;color:#F6FAFD;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0A1931;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;background:rgba(14,32,58,0.96);border:1px solid rgba(179,207,229,0.15);border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 16px;text-align:center;background:linear-gradient(135deg,#4A7FA7 0%,#20D6E8 100%);">
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#0A1931;">${APP_NAME}</h1>
                <p style="margin:8px 0 0;font-size:14px;line-height:1.5;color:#0A1931;">${heading}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#F6FAFD;">${greeting}</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#B3CFE5;">${intro}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                  <tr>
                    <td align="center" bgcolor="#20D6E8" style="border-radius:14px;">
                      <a href="${actionUrl}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:700;color:#0A1931;text-decoration:none;">${actionText}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#B3CFE5;">${outro}</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(179,207,229,0.75);word-break:break-word;">If the button does not work, copy and paste this link into your browser:<br />${actionUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;text-align:center;border-top:1px solid rgba(179,207,229,0.12);">
                <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(179,207,229,0.72);">This message was sent by ${APP_NAME}. If you did not request this action, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const sendEmail = async ({
  to,
  subject,
  html,
  text,
  fallbackLabel,
  fallbackLink
}) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    console.warn(
      "[auth.email] Email sending is disabled because SMTP is not configured."
    );
    console.info(`[auth.email] ${fallbackLabel}: ${fallbackLink}`);
    return { delivered: false, fallback: true };
  }

  return activeTransporter.sendMail({
    from: getSender(),
    to,
    subject,
    html,
    text
  });
};

const sendPasswordResetEmail = async ({ email, fullName, resetLink }) => {
  const subject = "Reset your Smart Rehab Platform password";
  const html = renderEmailTemplate({
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
  const html = renderEmailTemplate({
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
