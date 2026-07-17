export const AUTH_SESSION_EVENTS = {
  TOKEN_REFRESHED: "auth:token-refreshed",
  SESSION_EXPIRED: "auth:session-expired",
  LOGOUT: "auth:logout",
};

const handlers = {
  onTokenRefreshed: null,
  onSessionExpired: null,
  onLogout: null,
};

export function registerAuthSessionHandlers(nextHandlers = {}) {
  if (typeof nextHandlers.onTokenRefreshed === "function") {
    handlers.onTokenRefreshed = nextHandlers.onTokenRefreshed;
  }

  if (typeof nextHandlers.onSessionExpired === "function") {
    handlers.onSessionExpired = nextHandlers.onSessionExpired;
  }

  if (typeof nextHandlers.onLogout === "function") {
    handlers.onLogout = nextHandlers.onLogout;
  }

  return () => {
    handlers.onTokenRefreshed = null;
    handlers.onSessionExpired = null;
    handlers.onLogout = null;
  };
}

function dispatchBrowserEvent(name, detail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function notifyTokenRefreshed(payload) {
  handlers.onTokenRefreshed?.(payload);
  dispatchBrowserEvent(AUTH_SESSION_EVENTS.TOKEN_REFRESHED, payload);
}

export function notifySessionExpired(payload = {}) {
  handlers.onSessionExpired?.(payload);
  dispatchBrowserEvent(AUTH_SESSION_EVENTS.SESSION_EXPIRED, payload);
}

export function notifyLogout(payload = {}) {
  handlers.onLogout?.(payload);
  dispatchBrowserEvent(AUTH_SESSION_EVENTS.LOGOUT, payload);
}
