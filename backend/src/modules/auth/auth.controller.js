const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendVerificationSchema,
  verifyEmailSchema
} = require("./auth.validation");
const authService = require("./auth.service");
const refreshTokenService = require("./refreshToken.service");
const { buildFrontendPath } = require("../../config/frontend");
const {
  getRefreshTokenCookieName,
  getRefreshTokenCookieOptions,
  getRefreshTokenClearCookieOptions,
} = require("../../config/authCookies");
const { notifyAllAdmins } = require("../notifications/adminNotifications.helper");const { createAuditLog } = require("../auditLogs/auditLogs.helper");

const wantsHtmlResponse = (req) => {
  const accept = req.get("accept") || "";
  return accept.includes("text/html") && !accept.includes("application/json");
};

const renderVerifyEmailPage = ({ success, message }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${success ? "Email Verified" : "Verification Failed"} | Smart Rehab Platform</title>
  </head>
  <body style="margin:0;padding:32px 16px;background:#0A1A31;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#FFFFFF;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#0F2342;border:1px solid rgba(143,197,255,0.20);border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(15,35,66,0.22);">
            <tr>
              <td style="padding:24px 28px 16px;text-align:center;background:#D9EEFF;background-image:linear-gradient(180deg,#D9EEFF 0%,#CFE8FF 100%);">
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#0F2342;">Smart Rehab Platform</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 32px;text-align:center;background:#0F2342;">
                ${
                  success
                    ? ""
                    : `<div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;margin:0 auto 20px;border-radius:50%;background:rgba(255,138,138,0.12);border:1px solid rgba(255,138,138,0.28);font-size:28px;line-height:1;color:#ff8a8a;font-weight:700;">&#10007;</div>`
                }
                <p style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.25;color:${success ? "#4FA6F8" : "#ff8a8a"};">
                  ${success ? "Email verified successfully" : "Verification failed"}
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#D7E4F5;">${message}</p>
                ${
                  success
                    ? '<p style="margin:0;font-size:14px;line-height:1.7;color:#D7E4F5;">You can now return to the app and sign in.</p>'
                    : '<p style="margin:0;font-size:14px;line-height:1.7;color:#D7E4F5;">Request a new verification email from the app or contact support.</p>'
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const isMobileUserAgent = (req) => {
  const userAgent = req.get("user-agent") || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
};

const getMobileResetPasswordDeepLink = (token) => {
  const base =
    process.env.MOBILE_RESET_PASSWORD_URL || "smartrehab://reset-password";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}token=${encodeURIComponent(token)}`;
};

const getWebResetPasswordUrl = (token) =>
  buildFrontendPath("/reset-password", { token });

const renderResetPasswordRedirectPage = ({ appDeepLink, webResetUrl }) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password | Smart Rehab Platform</title>
    <style>
      .reset-actions {
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 14px 24px;
        font-size: 15px;
        font-weight: 700;
        border-radius: 12px;
        text-decoration: none;
        box-sizing: border-box;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }

      .reset-btn-primary {
        color: #FFFFFF;
        background: linear-gradient(90deg, #4FA6F8 0%, #66C4FF 100%);
        border: 1px solid #4FA6F8;
        box-shadow: 0 6px 18px rgba(79, 166, 248, 0.22);
      }

      .reset-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 22px rgba(79, 166, 248, 0.28);
      }

      .reset-btn-secondary {
        color: #4FA6F8;
        background: transparent;
        border: 1px solid #4FA6F8;
      }

      .reset-btn-secondary:hover {
        transform: translateY(-1px);
        background: rgba(79, 166, 248, 0.08);
        border-color: #4FA6F8;
        box-shadow: 0 6px 16px rgba(79, 166, 248, 0.12);
      }

      .reset-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 18px 0;
        color: rgba(143, 163, 188, 0.85);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .reset-divider::before,
      .reset-divider::after {
        content: "";
        flex: 1;
        height: 1px;
        background: rgba(143, 163, 188, 0.28);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    </style>
    <script>
      window.onload = function () {
        // Chrome on Android often blocks automatic custom-scheme redirects.
        // Try once, but keep manual buttons visible immediately.
        try {
          window.location.href = ${JSON.stringify(appDeepLink)};
        } catch (e) {}
      };
    </script>
  </head>
  <body style="margin:0;padding:32px 16px;background:#0A1A31;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#F6FAFD;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:#0F2342;border:1px solid rgba(143,197,255,0.20);border-radius:24px;overflow:hidden;box-shadow:0 8px 28px rgba(15,35,66,0.22);">
            <tr>
              <td style="padding:28px 28px 12px;text-align:center;background:#D9EEFF;background-image:linear-gradient(180deg,#D9EEFF 0%,#CFE8FF 100%);">
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#0F2342;">Smart Rehab Platform</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;text-align:center;background:#0F2342;">
                <p style="margin:0 0 12px;font-size:22px;font-weight:700;color:#4FA6F8;">Opening the app…</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#E6EEF8;">Tap the button below to open the Smart Rehab app and reset your password.</p>
                <div id="fallback" class="reset-actions">
                  <a href="${appDeepLink}" class="reset-btn reset-btn-primary">Open Mobile App</a>
                  <div class="reset-divider" aria-hidden="true">OR</div>
                  <a href="${webResetUrl}" class="reset-btn reset-btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"></circle>
                      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.4 3.8 9s-1.3 6.4-3.8 9M12 3C9.5 5.6 8.2 8.4 8.2 12s1.3 6.4 3.8 9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"></path>
                    </svg>
                    Continue on Web
                  </a>
                </div>
                <noscript>
                  <p class="sr-only">
                    <a href="${webResetUrl}">Continue password reset on web</a>
                  </p>
                </noscript>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const validateRequest = (schema, payload, res) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: true,
    stripUnknown: true
  });

  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return null;
  }

  return value;
};

const buildAuthSessionPayload = ({ accessToken, token, user }) => {
  const resolvedAccessToken = accessToken || token;

  return {
    token: resolvedAccessToken,
    accessToken: resolvedAccessToken,
    user,
  };
};

const setRefreshTokenCookie = (res, rawRefreshToken) => {
  res.cookie(
    getRefreshTokenCookieName(),
    rawRefreshToken,
    getRefreshTokenCookieOptions()
  );
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(
    getRefreshTokenCookieName(),
    getRefreshTokenClearCookieOptions()
  );
};

const register = async (req, res) => {
  try {
    const validatedBody = validateRequest(registerSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const user = await authService.registerUser(validatedBody);

    notifyAllAdmins({
      title: "New user registered",
      body: `${user.full_name} registered as ${user.role}.`,
      related_entity_type: "user",
      related_entity_id: user.id,
    }).catch((error) => {
      console.error(
        "[notifications] Failed to notify admins on register:",
        error.message
      );
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

const login = async (req, res) => {
  try {
    const validatedBody = validateRequest(loginSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const result = await authService.loginUser(
      validatedBody.email,
      validatedBody.password
    );

    createAuditLog({
      userId: result.user.id,
      action: "login",
      entityName: "user",
      entityId: result.user.id,
    }).catch(() => {});

    setRefreshTokenCookie(res, result.rawRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: buildAuthSessionPayload(result),
    });
  } catch (err) {
    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message
    });
  }
};

const refreshToken = async (req, res) => {
  const cookieName = getRefreshTokenCookieName();
  const rawRefreshToken = req.cookies?.[cookieName];

  if (!rawRefreshToken) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({
      success: false,
      message: refreshTokenService.REFRESH_TOKEN_INVALID_MESSAGE,
    });
  }

  try {
    const result = await refreshTokenService.rotateRefreshToken(rawRefreshToken);

    setRefreshTokenCookie(res, result.rawRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: buildAuthSessionPayload(result),
    });
  } catch (err) {
    clearRefreshTokenCookie(res);
    return res.status(err.statusCode || 401).json({
      success: false,
      message: err.message,
    });
  }
};

const logout = async (req, res) => {
  const cookieName = getRefreshTokenCookieName();
  const rawRefreshToken = req.cookies?.[cookieName];

  try {
    await refreshTokenService.logoutRefreshToken(rawRefreshToken);
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    clearRefreshTokenCookie(res);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const validatedBody = validateRequest(forgotPasswordSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const message = await authService.forgotPassword(validatedBody.email);

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const validatedBody = validateRequest(resetPasswordSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const message = await authService.resetPassword(
      validatedBody.token,
      validatedBody.newPassword
    );

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const openResetPassword = async (req, res) => {
  try {
    const validatedQuery = validateRequest(verifyEmailSchema, req.query, res);
    if (!validatedQuery) {
      return;
    }

    const token = validatedQuery.token;
    const webResetUrl = getWebResetPasswordUrl(token);
    const appDeepLink = getMobileResetPasswordDeepLink(token);

    if (isMobileUserAgent(req) || wantsHtmlResponse(req)) {
      return res
        .status(200)
        .type("html")
        .send(renderResetPasswordRedirectPage({ appDeepLink, webResetUrl }));
    }

    return res.redirect(302, webResetUrl);
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const sendVerification = async (req, res) => {
  try {
    const validatedBody = validateRequest(sendVerificationSchema, req.body, res);
    if (!validatedBody) {
      return;
    }

    const message = await authService.sendVerification(validatedBody.email);

    return res.status(200).json({
      success: true,
      message
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message
    });
  }
};

const verifyEmail = async (req, res) => {
  const respond = (statusCode, success, message) => {
    if (wantsHtmlResponse(req)) {
      return res.status(statusCode).type("html").send(
        renderVerifyEmailPage({ success, message })
      );
    }

    return res.status(statusCode).json({
      success,
      message
    });
  };

  try {
    const validatedQuery = validateRequest(verifyEmailSchema, req.query, res);
    if (!validatedQuery) {
      return;
    }

    const message = await authService.verifyEmail(validatedQuery.token);

    return respond(200, true, message);
  } catch (err) {
    return respond(err.statusCode || 400, false, err.message);
  }
};

const me = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};

const adminOnly = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Admin. You have access to this route",
    user: req.user
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  openResetPassword,
  sendVerification,
  verifyEmail,
  me,
  adminOnly
};
