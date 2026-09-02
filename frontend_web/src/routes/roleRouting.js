const ROLE_DASHBOARD_MAP = {
  admin: "/dashboard/admin",
  specialist: "/dashboard/specialist",
  parent: "/dashboard/parent",
};

export const SPECIALIST_VERIFICATION_PENDING_PATH =
  "/specialist-verification/pending";
export const SPECIALIST_VERIFICATION_REJECTED_PATH =
  "/specialist-verification/rejected";

function normalizeRole(role) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export function normalizeSpecialistVerificationStatus(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  if (normalized === "approved" || normalized === "rejected" || normalized === "pending") {
    return normalized;
  }
  return null;
}

export function getSpecialistVerificationStatus(user) {
  if (normalizeRole(user?.role) !== "specialist") {
    return null;
  }

  return (
    normalizeSpecialistVerificationStatus(
      user?.verification_status ?? user?.verificationStatus,
    ) || "pending"
  );
}

export function isApprovedSpecialist(user) {
  return getSpecialistVerificationStatus(user) === "approved";
}

export function dashboardForRole(role) {
  return ROLE_DASHBOARD_MAP[normalizeRole(role)] || null;
}

/**
 * Role home that also routes unapproved specialists to verification screens.
 */
export function homeForUser(user) {
  const role = normalizeRole(user?.role);
  if (role !== "specialist") {
    return dashboardForRole(role);
  }

  const status = getSpecialistVerificationStatus(user);
  if (status === "approved") {
    return ROLE_DASHBOARD_MAP.specialist;
  }
  if (status === "rejected") {
    return SPECIALIST_VERIFICATION_REJECTED_PATH;
  }
  return SPECIALIST_VERIFICATION_PENDING_PATH;
}

export function isSpecialistVerificationRoute(pathname) {
  return (
    pathname === SPECIALIST_VERIFICATION_PENDING_PATH
    || pathname === SPECIALIST_VERIFICATION_REJECTED_PATH
    || pathname.startsWith("/specialist-verification/")
  );
}

export function isProtectedDashboardRoute(pathname) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function canAccessRoute(role, pathname, user = null) {
  const normalizedRole = normalizeRole(role ?? user?.role);

  if (pathname === "/dashboard") {
    return Boolean(homeForUser(user || { role: normalizedRole }));
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return normalizedRole === "admin";
  }

  if (pathname.startsWith("/dashboard/specialist")) {
    return normalizedRole === "specialist" && isApprovedSpecialist(user || { role: normalizedRole });
  }

  if (pathname.startsWith("/dashboard/parent")) {
    return normalizedRole === "parent";
  }

  if (isSpecialistVerificationRoute(pathname)) {
    return normalizedRole === "specialist";
  }

  return !isProtectedDashboardRoute(pathname);
}

export function getRoleLabel(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "Admin";
  }

  if (normalizedRole === "specialist") {
    return "Specialist";
  }

  if (normalizedRole === "parent") {
    return "Parent";
  }

  return "User";
}
