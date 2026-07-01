import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./authContext";
import {
  clearAuthSession,
  clearPersistedSession,
  getAuthToken,
  getCurrentUser,
  getPersistedToken,
  getRememberMePreference,
  loadRememberedLogin,
  saveRememberedSession,
  saveTemporarySession,
  syncRestoredSession,
} from "../services/authStorage";

export function AuthProvider({ children }) {
  const initialUser = getCurrentUser();

  const [authState, setAuthState] = useState(() => ({
    token: initialUser ? getAuthToken() : null,
    user: initialUser,
    isInitializing: true,
  }));

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const rememberMe = getRememberMePreference();
      const token = getPersistedToken();

      if (!rememberMe || !token) {
        if (!rememberMe) {
          clearAuthSession();
        }

        if (!cancelled) {
          setAuthState({
            token: null,
            user: null,
            isInitializing: false,
          });
        }
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        const user = data?.data ?? null;

        syncRestoredSession({ token, user });

        if (!cancelled) {
          setAuthState({
            token,
            user,
            isInitializing: false,
          });
        }
      } catch {
        clearAuthSession();

        if (!cancelled) {
          setAuthState({
            token: null,
            user: null,
            isInitializing: false,
          });
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const isAuthenticated = Boolean(authState.token);
    const isVerified = Boolean(authState.user?.is_email_verified);

    return {
      ...authState,
      isAuthenticated,
      isVerified,
      async login({ email, password, rememberMe }) {
        const { data } = await api.post("/auth/login", { email, password });
        const token = data?.data?.token ?? null;
        const user = data?.data?.user ?? null;

        if (!token || !user) {
          throw new Error("Login response is missing session data.");
        }

        if (rememberMe) {
          saveRememberedSession({ token, user, email });
        } else {
          saveTemporarySession({ token, user });
        }

        setAuthState({
          token,
          user,
          isInitializing: false,
        });

        return user;
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        return data;
      },
      async verifyEmail(token) {
        const { data } = await api.get("/auth/verify-email", {
          params: { token },
        });
        return data?.message || "Email verified successfully.";
      },
      async refreshSession() {
        const token = getAuthToken();

        if (!token) {
          clearPersistedSession();
          setAuthState({
            token: null,
            user: null,
            isInitializing: false,
          });
          return null;
        }

        try {
          const { data } = await api.get("/auth/me");
          const user = data?.data ?? null;

          syncRestoredSession({ token, user });
          setAuthState({
            token,
            user,
            isInitializing: false,
          });

          return user;
        } catch {
          clearAuthSession();
          setAuthState({
            token: null,
            user: null,
            isInitializing: false,
          });
          return null;
        }
      },
      async sendVerification(email) {
        const { data } = await api.post("/auth/send-verification", { email });
        return data?.message || "Verification email sent successfully.";
      },
      logout(options = {}) {
        clearAuthSession(options);
        setAuthState({
          token: null,
          user: null,
          isInitializing: false,
        });
      },
      loadRememberedLogin,
    };
  }, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
