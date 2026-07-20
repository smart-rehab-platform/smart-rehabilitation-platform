import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import {
  extractAccessToken,
  logoutFromServer,
  resetSessionExpiredFlag,
  tryRestoreSessionFromCookie,
} from "../services/authRefresh";
import {
  registerAuthSessionHandlers,
} from "../services/authSessionBridge";
import {
  clearAuthSession,
  getAuthToken,
  getCurrentUser,
  getStoredAccessToken,
  getStoredUser,
  hasStoredAuthSession,
  loadRememberedLogin,
  storeAuthSession,
  syncRestoredSession,
} from "../services/authStorage";
import { AuthContext } from "./authContext";

function resolveLoginSession(data) {
  const accessToken = extractAccessToken(data);
  const user = data?.data?.user ?? null;

  if (!accessToken || !user) {
    throw new Error("Login response is missing session data.");
  }

  return { accessToken, user };
}

export function AuthProvider({ children }) {
  const initialToken = getStoredAccessToken();
  const initialUser = getCurrentUser();

  const [authState, setAuthState] = useState(() => ({
    token: initialToken,
    user: initialUser,
    isInitializing: true,
  }));

  const hadStoredSessionRef = useRef(hasStoredAuthSession());
  const authGenerationRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const restoreGeneration = authGenerationRef.current;

    const shouldApplyRestore = () =>
      !cancelled && authGenerationRef.current === restoreGeneration;

    const applySession = ({ accessToken, user }, { keepInitializing = false } = {}) => {
      if (!shouldApplyRestore()) {
        return;
      }

      setAuthState({
        token: accessToken,
        user,
        isInitializing: keepInitializing,
      });
    };

    const finishInitialization = (nextState) => {
      if (!shouldApplyRestore()) {
        return;
      }

      setAuthState({
        ...nextState,
        isInitializing: false,
      });
    };

    const clearSessionState = () => {
      finishInitialization({
        token: null,
        user: null,
      });
    };

    const unregisterHandlers = registerAuthSessionHandlers({
      onTokenRefreshed: ({ accessToken, user }) => {
        if (cancelled) {
          return;
        }

        setAuthState((previous) => ({
          ...previous,
          token: accessToken,
          user,
        }));
      },
      onSessionExpired: () => {
        clearSessionState();
      },
      onLogout: () => {
        clearSessionState();
      },
    });

    const handleStorageSync = (event) => {
      if (
        event.key !== "auth_token" &&
        event.key !== "auth_user" &&
        event.key !== "accessToken" &&
        event.key !== "user" &&
        event.key !== "remember_me"
      ) {
        return;
      }

      if (!getStoredAccessToken()) {
        clearAuthSession();
        clearSessionState();
      }
    };

    async function restoreSession() {
      const token = getStoredAccessToken();
      const user = getStoredUser();

      if (token && user) {
        applySession({ accessToken: token, user }, { keepInitializing: true });

        try {
          const { data } = await api.get("/auth/me");
          const freshUser = data?.data ?? user;
          syncRestoredSession({ token, user: freshUser });
          finishInitialization({ token, user: freshUser });
          return;
        } catch (error) {
          if (!error.response) {
            finishInitialization({ token, user });
            return;
          }

          if (error.response.status === 401) {
            clearSessionState();
          } else {
            finishInitialization({ token, user });
          }

          return;
        }
      }

      const restored = await tryRestoreSessionFromCookie();
      if (restored) {
        finishInitialization({
          token: restored.accessToken,
          user: restored.user,
        });
        return;
      }

      if (!shouldApplyRestore()) {
        return;
      }

      if (hadStoredSessionRef.current) {
        clearAuthSession();
      }

      clearSessionState();
    }

    window.addEventListener("storage", handleStorageSync);
    restoreSession();

    return () => {
      cancelled = true;
      unregisterHandlers();
      window.removeEventListener("storage", handleStorageSync);
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
        const { accessToken, user } = resolveLoginSession(data);

        resetSessionExpiredFlag();
        authGenerationRef.current += 1;
        storeAuthSession({
          accessToken,
          user,
          rememberMe,
          email,
        });

        setAuthState({
          token: accessToken,
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
          const restored = await tryRestoreSessionFromCookie();
          if (restored) {
            setAuthState({
              token: restored.accessToken,
              user: restored.user,
              isInitializing: false,
            });
            return restored.user;
          }

          clearAuthSession();
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

          if (!user) {
            throw new Error("Unable to refresh user profile.");
          }

          syncRestoredSession({ token, user });
          setAuthState({
            token,
            user,
            isInitializing: false,
          });

          return user;
        } catch (error) {
          if (!error.response) {
            return getCurrentUser();
          }

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
      async logout(options = {}) {
        try {
          await logoutFromServer();
        } catch {
          // Local logout must still succeed.
        } finally {
          clearAuthSession(options);
          setAuthState({
            token: null,
            user: null,
            isInitializing: false,
          });
        }
      },
      loadRememberedLogin,
    };
  }, [authState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
