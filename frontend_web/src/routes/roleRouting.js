const ROLE_DASHBOARD_MAP = {
  admin: "/dashboard/admin",
  specialist: "/dashboard/specialist",
  parent: "/dashboard/parent",
};

function normalizeRole(role) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export function dashboardForRole(role) {
  return ROLE_DASHBOARD_MAP[normalizeRole(role)] || null;
}

export function isProtectedDashboardRoute(pathname) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function canAccessRoute(role, pathname) {
  const normalizedRole = normalizeRole(role);

  if (pathname === "/dashboard") {
    return Boolean(dashboardForRole(normalizedRole));
  }

  if (pathname.startsWith("/dashboard/admin")) {
    return normalizedRole === "admin";
  }

  if (pathname.startsWith("/dashboard/specialist")) {
    return normalizedRole === "specialist";
  }

  if (pathname.startsWith("/dashboard/parent")) {
    return normalizedRole === "parent";
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
