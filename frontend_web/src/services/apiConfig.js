const normalizeApiBaseUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "http://localhost:5000/api/v1";
  }

  return value.trim().replace(/\/+$/, "");
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env?.VITE_API_URL);

function getApiOrigin() {
  return API_BASE_URL.replace(/\/api\/v1\/?$/i, "");
}

function isLoopbackHost(hostname) {
  return hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "[::1]";
}

function normalizeLoopbackUploadHost(urlString) {
  try {
    const url = new URL(urlString);
    const configuredOrigin = new URL(getApiOrigin());

    if (
      isLoopbackHost(url.hostname)
      && isLoopbackHost(configuredOrigin.hostname)
      && url.port === configuredOrigin.port
      && url.pathname.startsWith("/uploads")
    ) {
      url.hostname = configuredOrigin.hostname;
      return url.href;
    }

    return url.href;
  } catch {
    return urlString;
  }
}

/**
 * Resolves uploaded asset URLs for browser use.
 * Supports absolute URLs, relative /uploads paths, and uploads/... paths.
 * @param {string|null|undefined} fileUrl
 * @returns {string|null}
 */
function resolveUploadedAssetUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  const trimmed = fileUrl.trim().replace(/\\/g, "/");
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return normalizeLoopbackUploadHost(trimmed);
  }

  const origin = getApiOrigin();

  if (trimmed.startsWith("/")) {
    return normalizeLoopbackUploadHost(`${origin}${trimmed}`);
  }

  if (trimmed.startsWith("uploads/")) {
    return normalizeLoopbackUploadHost(`${origin}/${trimmed}`);
  }

  return null;
}

export {
  API_BASE_URL,
  normalizeApiBaseUrl,
  getApiOrigin,
  resolveUploadedAssetUrl,
};
