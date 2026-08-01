export const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

/** Auth routes that must render even when a session already exists. */
export const AUTH_ROUTES_ALLOWING_AUTHENTICATED_SESSION = [
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function isPublicAuthRoute(pathname) {
  return PUBLIC_AUTH_ROUTES.includes(pathname);
}

export function isAuthRouteAllowingAuthenticatedSession(pathname) {
  return AUTH_ROUTES_ALLOWING_AUTHENTICATED_SESSION.includes(pathname);
}
