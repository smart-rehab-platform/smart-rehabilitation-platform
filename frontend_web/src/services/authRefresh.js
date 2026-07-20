import axios from "axios";
import { API_BASE_URL } from "./apiConfig";
import {
  clearAuthSession,
  updateStoredAccessToken,
} from "./authStorage";
import {
  notifySessionExpired,
  notifyTokenRefreshed,
} from "./authSessionBridge";

export const AUTH_ENDPOINTS_NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/send-verification",
  "/auth/refresh-token",
  "/auth/logout",
];

let refreshPromise = null;
let sessionExpiredNotified = false;

export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function resetSessionExpiredFlag() {
  sessionExpiredNotified = false;
}

export function extractAccessToken(data) {
  return data?.data?.accessToken ?? data?.data?.token ?? null;
}

export function extractUser(data) {
  return data?.data?.user ?? null;
}

function notifySessionExpiredOnce(payload = { reason: "session-expired" }) {
  if (sessionExpiredNotified) {
    return;
  }

  sessionExpiredNotified = true;
  notifySessionExpired(payload);
}

function applyRefreshResponse(data) {
  const accessToken = extractAccessToken(data);
  const user = extractUser(data);

  if (!accessToken || !user) {
    throw new Error("Refresh response is missing session data.");
  }

  updateStoredAccessToken(accessToken, user);
  resetSessionExpiredFlag();
  notifyTokenRefreshed({ accessToken, user });

  return { accessToken, user };
}

async function requestRefreshToken() {
  const { data } = await refreshClient.post("/auth/refresh-token");
  return applyRefreshResponse(data);
}

export async function refreshAccessToken({ notifyOnFailure = true } = {}) {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken()
      .catch((error) => {
        if (notifyOnFailure) {
          clearAuthSession();
          notifySessionExpiredOnce();
        }
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function tryRestoreSessionFromCookie() {
  try {
    return await refreshAccessToken({ notifyOnFailure: false });
  } catch {
    return null;
  }
}

export async function logoutFromServer() {
  await refreshClient.post("/auth/logout");
}

export function shouldSkipAuthRefresh(config) {
  if (!config || config.skipAuthRefresh) {
    return true;
  }

  if (config._retry) {
    return true;
  }

  const requestUrl = `${config.baseURL || ""}${config.url || ""}`;

  return AUTH_ENDPOINTS_NO_REFRESH.some((endpoint) =>
    requestUrl.includes(endpoint)
  );
}
