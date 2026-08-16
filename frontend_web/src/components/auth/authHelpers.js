export {
  getPasswordRules,
  getPasswordStrength,
  getStrongPasswordMessage,
} from "./authLocalization.js";

export function readAuthApiMessage(error, fallbackMessage) {
  const message = error?.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return fallbackMessage;
}

export function resolveUploadUrl(url) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  const origin = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export function resolveUploadedImageUrl(url) {
  return resolveUploadUrl(url);
}

/** @deprecated Use getStrongPasswordMessage(t) */
export const strongPasswordMessage =
  "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
