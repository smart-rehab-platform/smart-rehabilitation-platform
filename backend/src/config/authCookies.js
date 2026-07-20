const REFRESH_TOKEN_AUTH_PATH = "/api/v1/auth";

const DEFAULT_REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
const DEFAULT_REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;
const DEFAULT_COOKIE_SECURE = false;
const DEFAULT_COOKIE_SAME_SITE = "lax";
const ALLOWED_SAME_SITE_VALUES = new Set(["lax", "strict", "none"]);

const parseBooleanEnv = (value, defaultValue) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const parsePositiveInteger = (value, defaultValue) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

const getRefreshTokenCookieName = () => {
  const configured = process.env.REFRESH_TOKEN_COOKIE_NAME;

  if (typeof configured === "string" && configured.trim()) {
    return configured.trim();
  }

  return DEFAULT_REFRESH_TOKEN_COOKIE_NAME;
};

const getRefreshTokenExpiresInDays = () =>
  parsePositiveInteger(
    process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS,
    DEFAULT_REFRESH_TOKEN_EXPIRES_IN_DAYS
  );

const getRefreshTokenMaxAgeMs = () =>
  getRefreshTokenExpiresInDays() * 24 * 60 * 60 * 1000;

const getRefreshTokenExpiresAt = () =>
  new Date(Date.now() + getRefreshTokenMaxAgeMs());

const getCookieDomain = () => {
  const configured = process.env.COOKIE_DOMAIN;

  if (typeof configured !== "string" || !configured.trim()) {
    return undefined;
  }

  return configured.trim();
};

const resolveSameSite = () => {
  const configured = String(process.env.COOKIE_SAME_SITE || DEFAULT_COOKIE_SAME_SITE)
    .trim()
    .toLowerCase();

  if (ALLOWED_SAME_SITE_VALUES.has(configured)) {
    return configured;
  }

  return DEFAULT_COOKIE_SAME_SITE;
};

const resolveSecureFlag = (sameSite) => {
  const configuredSecure = parseBooleanEnv(
    process.env.COOKIE_SECURE,
    DEFAULT_COOKIE_SECURE
  );

  if (sameSite === "none") {
    return true;
  }

  return configuredSecure;
};

const getBaseCookieOptions = () => {
  const sameSite = resolveSameSite();
  const secure = resolveSecureFlag(sameSite);
  const domain = getCookieDomain();

  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: REFRESH_TOKEN_AUTH_PATH,
  };

  if (domain) {
    options.domain = domain;
  }

  return options;
};

const getRefreshTokenCookieOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: getRefreshTokenMaxAgeMs(),
});

const getRefreshTokenClearCookieOptions = () => getBaseCookieOptions();

module.exports = {
  REFRESH_TOKEN_AUTH_PATH,
  getRefreshTokenCookieName,
  getRefreshTokenExpiresInDays,
  getRefreshTokenMaxAgeMs,
  getRefreshTokenExpiresAt,
  getRefreshTokenCookieOptions,
  getRefreshTokenClearCookieOptions,
};
