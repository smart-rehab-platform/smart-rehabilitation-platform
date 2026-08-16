/**
 * Admin dashboard routes registered in frontend_web App.jsx.
 */
export const ADMIN_WEB_ROUTES = {
  dashboard: "/dashboard/admin",
  users: "/dashboard/admin/users",
  patients: "/dashboard/admin/patients",
  patientDetails: "/dashboard/admin/patients/:patientId",
  patientAssignments: "/dashboard/admin/patient-assignments",
  caseRequests: "/dashboard/admin/case-requests",
  complaints: "/dashboard/admin/complaints",
  complaintDetails: "/dashboard/admin/complaints/:complaintId",
  supportRequests: "/dashboard/admin/support-requests",
  supportRequestDetails: "/dashboard/admin/support-requests/:requestId",
  exercises: "/dashboard/admin/exercises",
  exerciseAdd: "/dashboard/admin/exercises/new",
  exerciseDetails: "/dashboard/admin/exercises/:exerciseId",
  exerciseEdit: "/dashboard/admin/exercises/:exerciseId/edit",
  sessions: "/dashboard/admin/sessions",
  reports: "/dashboard/admin/reports",
  reportDetails: "/dashboard/admin/reports/:reportId",
  aiCenter: "/dashboard/admin/ai-center",
  auditLogs: "/dashboard/admin/audit-logs",
  notifications: "/dashboard/admin/notifications",
  profile: "/dashboard/admin/profile",
  profileEdit: "/dashboard/admin/profile/edit",
  login: "/login",
};

/** Maps sidebar nav item ids to ADMIN_WEB_ROUTES keys. */
export const ADMIN_SIDEBAR_NAV_ROUTE_KEYS = {
  dashboard: "dashboard",
  users: "users",
  patients: "patients",
  patientAssignments: "patientAssignments",
  caseRequests: "caseRequests",
  complaints: "complaints",
  supportRequests: "supportRequests",
  exercises: "exercises",
  sessions: "sessions",
  reports: "reports",
  aiCenter: "aiCenter",
  auditLogs: "auditLogs",
  notifications: "notifications",
  profile: "profile",
};

const SIDEBAR_ACTIVE_ROUTE_MATCHERS = [
  { prefix: ADMIN_WEB_ROUTES.users, navId: "users" },
  { prefix: ADMIN_WEB_ROUTES.patientAssignments, navId: "patientAssignments" },
  { prefix: ADMIN_WEB_ROUTES.patients, navId: "patients" },
  { prefix: ADMIN_WEB_ROUTES.caseRequests, navId: "caseRequests" },
  { prefix: ADMIN_WEB_ROUTES.complaints, navId: "complaints" },
  { prefix: ADMIN_WEB_ROUTES.supportRequests, navId: "supportRequests" },
  { prefix: ADMIN_WEB_ROUTES.exercises, navId: "exercises" },
  { prefix: ADMIN_WEB_ROUTES.sessions, navId: "sessions" },
  { prefix: ADMIN_WEB_ROUTES.reports, navId: "reports" },
  { prefix: ADMIN_WEB_ROUTES.aiCenter, navId: "aiCenter" },
  { prefix: ADMIN_WEB_ROUTES.auditLogs, navId: "auditLogs" },
  { prefix: ADMIN_WEB_ROUTES.notifications, navId: "notifications" },
  { prefix: ADMIN_WEB_ROUTES.profile, navId: "profile" },
];

/**
 * Resolves a registered admin route path from a nav/route key.
 * @param {string|null|undefined} routeKey
 */
export function getAdminRoutePath(routeKey) {
  if (!routeKey || typeof routeKey !== "string") {
    return null;
  }

  return ADMIN_WEB_ROUTES[routeKey] ?? null;
}

/** Raw role values accepted by the Admin Users role filter / `?role=` query param. */
export const ADMIN_USERS_ROLE_FILTER_VALUES = ["admin", "specialist", "parent"];

/**
 * Parses a Users page role query param into a supported raw role filter value.
 * @param {string|null|undefined} value
 * @returns {"admin"|"specialist"|"parent"|null}
 */
export function parseAdminUsersRoleParam(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return ADMIN_USERS_ROLE_FILTER_VALUES.includes(normalized) ? normalized : null;
}

/**
 * Builds the admin users route, optionally preselecting a role filter.
 * @param {string|null|undefined} role
 */
export function buildAdminUsersPath(role) {
  const parsedRole = parseAdminUsersRoleParam(role);
  if (!parsedRole) {
    return ADMIN_WEB_ROUTES.users;
  }

  return `${ADMIN_WEB_ROUTES.users}?role=${encodeURIComponent(parsedRole)}`;
}

/**
 * Builds the admin patient details route for a specific patient id.
 * @param {string} patientId
 */
export function buildAdminPatientDetailsPath(patientId) {
  const id = typeof patientId === "string" ? patientId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.patients;
  }

  return `/dashboard/admin/patients/${encodeURIComponent(id)}`;
}

/**
 * Builds the admin patient assignments route, optionally preselecting a patient.
 * @param {string|null|undefined} patientId
 */
export function buildAdminPatientAssignmentsPath(patientId) {
  const id = typeof patientId === "string" ? patientId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.patientAssignments;
  }

  return `${ADMIN_WEB_ROUTES.patientAssignments}?patientId=${encodeURIComponent(id)}`;
}

/**
 * Builds the admin complaint details route for a specific complaint id.
 * @param {string} complaintId
 */
export function buildAdminComplaintDetailsPath(complaintId) {
  const id = typeof complaintId === "string" ? complaintId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.complaints;
  }

  return `/dashboard/admin/complaints/${encodeURIComponent(id)}`;
}

export function buildAdminSupportRequestDetailsPath(requestId) {
  const id = typeof requestId === "string" ? requestId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.supportRequests;
  }

  return `/dashboard/admin/support-requests/${encodeURIComponent(id)}`;
}

/**
 * Builds the admin case request details route for a specific request id.
 * @param {string} requestId
 */
export function buildAdminCaseRequestDetailsPath(requestId) {
  const id = typeof requestId === "string" ? requestId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.caseRequests;
  }

  return `/dashboard/admin/case-requests/${encodeURIComponent(id)}`;
}

/**
 * Builds the admin case request specialist selection route.
 * @param {string} requestId
 */
export function buildAdminCaseRequestSpecialistsPath(requestId) {
  const id = typeof requestId === "string" ? requestId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.caseRequests;
  }

  return `/dashboard/admin/case-requests/${encodeURIComponent(id)}/specialists`;
}

/**
 * Builds the admin add-exercise route.
 */
export function buildAdminExerciseAddPath() {
  return ADMIN_WEB_ROUTES.exerciseAdd;
}

/**
 * Builds the admin exercise details route for a specific exercise id.
 * @param {string} exerciseId
 */
export function buildAdminExerciseDetailsPath(exerciseId) {
  const id = typeof exerciseId === "string" ? exerciseId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.exercises;
  }

  return `/dashboard/admin/exercises/${encodeURIComponent(id)}`;
}

/**
 * Builds the admin edit-exercise route for a specific exercise id.
 * @param {string} exerciseId
 */
export function buildAdminExerciseEditPath(exerciseId) {
  const id = typeof exerciseId === "string" ? exerciseId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.exercises;
  }

  return `/dashboard/admin/exercises/${encodeURIComponent(id)}/edit`;
}

/**
 * Builds the admin report details route.
 * Always includes `?ai=0|1` because report IDs come from two tables.
 * @param {string} reportId
 * @param {boolean} isAiReport
 */
export function buildAdminProfilePath() {
  return ADMIN_WEB_ROUTES.profile;
}

export function buildAdminEditProfilePath() {
  return ADMIN_WEB_ROUTES.profileEdit;
}

export function buildAdminReportDetailsPath(reportId, isAiReport) {
  const id = typeof reportId === "string" ? reportId.trim() : "";
  if (!id) {
    return ADMIN_WEB_ROUTES.reports;
  }

  const ai = isAiReport === true ? "1" : "0";
  return `/dashboard/admin/reports/${encodeURIComponent(id)}?ai=${ai}`;
}

/**
 * Resolves the active sidebar nav id from the current pathname.
 * @param {string|null|undefined} pathname
 */
export function resolveAdminSidebarActiveId(pathname) {
  if (!pathname || typeof pathname !== "string") {
    return "dashboard";
  }

  if (pathname === ADMIN_WEB_ROUTES.dashboard) {
    return "dashboard";
  }

  for (const matcher of SIDEBAR_ACTIVE_ROUTE_MATCHERS) {
    if (pathname === matcher.prefix || pathname.startsWith(`${matcher.prefix}/`)) {
      return matcher.navId;
    }
  }

  return "dashboard";
}
