const fs = require("fs");
const path = require("path");

const LOGO_CID = "smart-rehab-logo";
const APP_NAME = "Smart Rehab Platform";

const BRAND_ICON_PATHS = [
  path.resolve(
    __dirname,
    "../../../../../frontend_web/src/assets/branding/smart_rehab_horizontal_logo2222.png"
  ),
  path.resolve(
    __dirname,
    "../../../../../mobile_app/assets/branding/smart_rehab_horizontal_logo2222.png"
  ),
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolveFirstExistingPath = (paths) => {
  for (const candidate of paths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

const getPasswordResetEmailAttachments = () => {
  if (process.env.EMAIL_LOGO_URL) {
    return [];
  }

  const iconPath = resolveFirstExistingPath(BRAND_ICON_PATHS);
  if (!iconPath) {
    return [];
  }

  return [
    {
      filename: "smart-rehab-brand-icon.png",
      path: iconPath,
      cid: LOGO_CID,
    },
  ];
};

const HEADER_ICON_SIZE = 46;

const renderHeaderIcon = () => {
  const iconStyle = `display:block;width:${HEADER_ICON_SIZE}px;max-width:${HEADER_ICON_SIZE}px;height:auto;border:0`;

  if (process.env.EMAIL_LOGO_URL) {
    return `<img src="${escapeHtml(process.env.EMAIL_LOGO_URL)}" alt="" width="${HEADER_ICON_SIZE}" style="${iconStyle}">`;
  }

  if (resolveFirstExistingPath(BRAND_ICON_PATHS)) {
    return `<img src="cid:${LOGO_CID}" alt="" width="${HEADER_ICON_SIZE}" style="${iconStyle}">`;
  }

  return "&nbsp;";
};

const renderPasswordResetEmailTemplate = ({
  heading,
  preheader,
  greeting,
  intro,
  actionText,
  actionUrl,
  outro,
}) => {
  const safeHeading = escapeHtml(heading);
  const safePreheader = escapeHtml(preheader);
  const safeGreeting = escapeHtml(greeting);
  const safeIntro = escapeHtml(intro);
  const safeActionText = escapeHtml(actionText);
  const safeActionUrl = escapeHtml(actionUrl);
  const safeOutro = escapeHtml(outro);
  const headerIcon = renderHeaderIcon();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safeHeading}</title>
</head>
<body style="margin:0;padding:0;background:#0A1A31;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#FFFFFF">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${safePreheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A1A31">
<tr>
<td align="center" style="padding:16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0F2342;border-radius:16px;overflow:hidden;border:1px solid rgba(143,197,255,0.20)">
<tr>
<td style="padding:20px 24px;background:#D9EEFF;background-image:linear-gradient(180deg,#D9EEFF 0%,#CFE8FF 100%)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="52" valign="top" align="left" style="padding-top:2px">${headerIcon}</td>
<td align="center" valign="middle" style="font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">
<p style="margin:0;font-size:24px;line-height:1.2;font-weight:700;color:#0F2342">${APP_NAME}</p>
<p style="margin:6px 0 0;font-size:14px;line-height:1.3;font-weight:500;color:#4FA6F8">${safeHeading}</p>
</td>
<td width="52">&nbsp;</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:34px 36px;background:#0F2342">
<p style="margin:0 0 20px;font-size:18px;line-height:1.3;font-weight:700;color:#FFFFFF;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">${safeGreeting}</p>
<p style="margin:0;font-size:15px;line-height:1.7;color:#B8C9DE;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">${safeIntro}</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto">
<tr>
<td align="center" bgcolor="#4FA6F8" style="border-radius:12px;background-color:#4FA6F8;background-image:linear-gradient(180deg,#4FA6F8 0%,#66C4FF 100%)">
<a href="${safeActionUrl}" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;line-height:1.2;color:#FFFFFF;text-decoration:none;border-radius:12px;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">${safeActionText}</a>
</td>
</tr>
</table>
<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#B8C9DE;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">${safeOutro}</p>
<p style="margin:0;font-size:13px;line-height:1.5;color:#8FA3BC;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">If the button does not work, copy and paste this link into your browser:<br><a href="${safeActionUrl}" style="color:#4FA6F8;word-break:break-all">${safeActionUrl}</a></p>
</td>
</tr>
<tr>
<td align="center" style="padding:20px 24px;background:#0F2342;border-top:1px solid rgba(143,197,255,0.18)">
<p style="margin:0;font-size:12px;line-height:1.6;color:#8FA3BC;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif">This message was sent by ${APP_NAME}.<br>If you did not request this action, you can safely ignore this email.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
};

const buildPasswordResetEmailContent = (templateData) => ({
  html: renderPasswordResetEmailTemplate(templateData),
  attachments: getPasswordResetEmailAttachments(),
});

module.exports = {
  LOGO_CID,
  buildPasswordResetEmailContent,
  getPasswordResetEmailAttachments,
  renderPasswordResetEmailTemplate,
};
