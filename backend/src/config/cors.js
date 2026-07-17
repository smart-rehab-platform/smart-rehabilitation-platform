const { getFrontendBaseUrl, normalizeBaseUrl } = require("./frontend");

const DEV_DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const HTTP_ALLOWED_HEADERS = ["Authorization", "Content-Type"];

const isProduction = () => process.env.NODE_ENV === "production";

const parseCsvOrigins = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => normalizeBaseUrl(entry))
    .filter(Boolean);
};

const getAllowedOrigins = () => {
  const origins = new Set();
  const frontendUrl = getFrontendBaseUrl();

  if (frontendUrl) {
    origins.add(frontendUrl);
  }

  parseCsvOrigins(process.env.CORS_ALLOWED_ORIGINS).forEach((origin) => {
    origins.add(origin);
  });

  if (!isProduction()) {
    DEV_DEFAULT_ORIGINS.forEach((origin) => origins.add(origin));
  }

  return [...origins];
};

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(normalizeBaseUrl(origin));
};

const createOriginValidator = () => (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  if (isAllowedOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error("Origin not allowed by CORS"));
};

const getExpressCorsOptions = () => ({
  origin: createOriginValidator(),
  credentials: true,
  methods: HTTP_METHODS,
  allowedHeaders: HTTP_ALLOWED_HEADERS,
});

const getSocketIoCorsOptions = () => ({
  origin: createOriginValidator(),
  credentials: true,
  methods: HTTP_METHODS,
  allowedHeaders: HTTP_ALLOWED_HEADERS,
});

module.exports = {
  getAllowedOrigins,
  isAllowedOrigin,
  createOriginValidator,
  getExpressCorsOptions,
  getSocketIoCorsOptions,
};
