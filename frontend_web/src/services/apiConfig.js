const normalizeApiBaseUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "http://localhost:5000/api/v1";
  }

  return value.trim().replace(/\/+$/, "");
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export { API_BASE_URL, normalizeApiBaseUrl };
