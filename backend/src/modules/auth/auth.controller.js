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
  <body style="margin:0;padding:32px 16px;background:#0A1931;font-family:Arial,sans-serif;color:#F6FAFD;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:rgba(14,32,58,0.96);border:1px solid rgba(179,207,229,0.15);border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 12px;text-align:center;background:linear-gradient(135deg,#4A7FA7 0%,#20D6E8 100%);">
                <h1 style="margin:0;font-size:24px;color:#0A1931;">Smart Rehab Platform</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;text-align:center;">
                <p style="margin:0 0 12px;font-size:22px;font-weight:700;color:${success ? "#20D6E8" : "#ff8a8a"};">
                  ${success ? "Email verified successfully" : "Verification failed"}
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#B3CFE5;">${message}</p>
                ${
                  success
                    ? '<p style="margin:0;font-size:14px;color:#B3CFE5;">You can now return to the app and sign in.</p>'
                    : '<p style="margin:0;font-size:14px;color:#B3CFE5;">Request a new verification email from the app or contact support.</p>'
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
  <body style="margin:0;padding:32px 16px;background:#0A1931;font-family:Arial,sans-serif;color:#F6FAFD;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background:rgba(14,32,58,0.96);border:1px solid rgba(179,207,229,0.15);border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 12px;text-align:center;background:linear-gradient(135deg,#4A7FA7 0%,#20D6E8 100%);">
                <h1 style="margin:0;font-size:24px;color:#0A1931;">Smart Rehab Platform</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;text-align:center;">
                <p style="margin:0 0 12px;font-size:22px;font-weight:700;color:#20D6E8;">Opening the app…</p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#B3CFE5;">Tap the button below to open the Smart Rehab app and reset your password.</p>
                <div id="fallback">
                  <p style="margin:0 0 16px;">
                    <a href="${appDeepLink}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:700;color:#0A1931;background:#20D6E8;border-radius:14px;text-decoration:none;">Open Mobile App</a>
                  </p>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#B3CFE5;">
                    Or continue on the web:<br />
                    <a href="${webResetUrl}" style="color:#20D6E8;word-break:break-all;">${webResetUrl}</a>
                  </p>
                </div>
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
