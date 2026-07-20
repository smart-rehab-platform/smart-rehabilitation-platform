const DEFAULT_FRONTEND_URL = "http://localhost:5173";

const normalizeBaseUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\/+$/, "");
};

const getFrontendBaseUrl = () =>
  normalizeBaseUrl(process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL);

const buildFrontendPath = (path, queryParams = {}) => {
  const base = getFrontendBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

module.exports = {
  DEFAULT_FRONTEND_URL,
  getFrontendBaseUrl,
  buildFrontendPath,
  normalizeBaseUrl,
};
