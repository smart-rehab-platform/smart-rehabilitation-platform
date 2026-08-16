/**
 * Specialist dashboard routes registered in frontend_web App.jsx.
 */
export const SPECIALIST_WEB_ROUTES = {
  dashboard: "/dashboard/specialist",
  patients: "/dashboard/specialist/patients",
  caseRequests: "/dashboard/specialist/case-requests",
  reviews: "/dashboard/specialist/reviews",
  sessions: "/dashboard/specialist/sessions",
  exercises: "/dashboard/specialist/exercises",
  treatmentPlans: "/dashboard/specialist/treatment-plans",
  progress: "/dashboard/specialist/progress",
  messages: "/dashboard/specialist/messages",
  notifications: "/dashboard/specialist/notifications",
  supportRequests: "/dashboard/specialist/support-requests",
  supportRequestNew: "/dashboard/specialist/support-requests/new",
  supportRequestDetails: "/dashboard/specialist/support-requests/:requestId",
  reports: "/dashboard/specialist/reports",
  profile: "/dashboard/specialist/profile",
  profileEdit: "/dashboard/specialist/profile/edit",
  login: "/login",
};

/** Maps sidebar nav item ids to SPECIALIST_WEB_ROUTES keys. */
export const SPECIALIST_SIDEBAR_NAV_ROUTE_KEYS = {
  dashboard: "dashboard",
  patients: "patients",
  caseRequests: "caseRequests",
  exercises: "exercises",
  sessions: "sessions",
  reviews: "reviews",
  treatmentPlans: "treatmentPlans",
  reports: "reports",
  messages: "messages",
  notifications: "notifications",
  supportRequests: "supportRequests",
  profile: "profile",
};

/** Temporary placeholder destinations until feature pages ship. */
export const SPECIALIST_PLACEHOLDER_FEATURES = {
  sessions: { title: "Sessions" },
  progress: { title: "Patient Progress" },
  patientGoals: { title: "Manage Goals" },
  assignExercise: { title: "Assign Exercise" },
  aiRecommendations: { title: "AI Recommendations" },
  speechAnalysis: { title: "Speech Analysis" },
};

export const SPECIALIST_NAV_UNAVAILABLE = {
  generic: "This feature is not available on web yet.",
};

const IMPLEMENTED_SPECIALIST_PATHS = new Set(
  Object.entries(SPECIALIST_WEB_ROUTES)
    .filter(([key]) => key !== "login")
    .map(([, path]) => path),
);

const SIDEBAR_ACTIVE_ROUTE_MATCHERS = [
  { prefix: SPECIALIST_WEB_ROUTES.patients, navId: "patients" },
  { prefix: SPECIALIST_WEB_ROUTES.caseRequests, navId: "caseRequests" },
  { prefix: SPECIALIST_WEB_ROUTES.reviews, navId: "reviews" },
  { prefix: SPECIALIST_WEB_ROUTES.reports, navId: "reports" },
  { prefix: SPECIALIST_WEB_ROUTES.sessions, navId: "sessions" },
  { prefix: SPECIALIST_WEB_ROUTES.exercises, navId: "exercises" },
  { prefix: SPECIALIST_WEB_ROUTES.treatmentPlans, navId: "treatmentPlans" },
  { prefix: SPECIALIST_WEB_ROUTES.messages, navId: "messages" },
  { prefix: SPECIALIST_WEB_ROUTES.notifications, navId: "notifications" },
  { prefix: SPECIALIST_WEB_ROUTES.supportRequests, navId: "supportRequests" },
  { prefix: SPECIALIST_WEB_ROUTES.profile, navId: "profile" },
];

/** Sentinel active id when no sidebar item should be highlighted. */
export const SPECIALIST_NO_SIDEBAR_ACTIVE = "__none__";

/**
 * Builds the specialist messages path with optional conversation id.
 * @param {string|null|undefined} conversationId
 */
export function buildSpecialistMessagesPath(conversationId = null) {
  if (!conversationId) {
    return SPECIALIST_WEB_ROUTES.messages;
  }

  return `${SPECIALIST_WEB_ROUTES.messages}/${encodeURIComponent(conversationId)}`;
}

export function buildSpecialistSupportRequestsPath() {
  return SPECIALIST_WEB_ROUTES.supportRequests;
}

export function buildSpecialistSupportRequestNewPath() {
  return SPECIALIST_WEB_ROUTES.supportRequestNew;
}

export function buildSpecialistSupportRequestDetailPath(requestId) {
  const id = typeof requestId === "string" ? requestId.trim() : "";
  if (!id) {
    return SPECIALIST_WEB_ROUTES.supportRequests;
  }

  return `/dashboard/specialist/support-requests/${encodeURIComponent(id)}`;
}

export function buildSpecialistPatientDetailPath(patientId) {
  return `${SPECIALIST_WEB_ROUTES.patients}/${encodeURIComponent(patientId)}`;
}

export function buildSpecialistPatientGoalsPath(patientId) {
  return `${buildSpecialistPatientDetailPath(patientId)}/goals`;
}

export function buildSpecialistPatientAiRecommendationsPath(patientId) {
  return `${buildSpecialistPatientDetailPath(patientId)}/ai-recommendations`;
}

export function buildSpecialistPatientSpeechAnalysisPath(patientId, submissionId = null) {
  const base = `${buildSpecialistPatientDetailPath(patientId)}/speech-analysis`;
  if (!submissionId) {
    return base;
  }
  return `${base}?submissionId=${encodeURIComponent(submissionId)}`;
}

export function buildSpecialistReviewExercisePath(submissionId) {
  return `${SPECIALIST_WEB_ROUTES.reviews}/${encodeURIComponent(submissionId)}`;
}

export function buildSpecialistPatientAssignExercisePath(patientId, planId) {
  const base = `${buildSpecialistPatientDetailPath(patientId)}/assign-exercise`;
  if (!planId) {
    return base;
  }
  return `${base}?planId=${encodeURIComponent(planId)}`;
}

export function buildSpecialistPatientReportsPath(patientId) {
  if (!patientId) {
    return SPECIALIST_WEB_ROUTES.reports;
  }
  return `${SPECIALIST_WEB_ROUTES.reports}?patientId=${encodeURIComponent(patientId)}`;
}

export function buildSpecialistReportDetailsPath(reportId, { isAi = false, patientId = null } = {}) {
  const params = new URLSearchParams();
  params.set("ai", isAi ? "1" : "0");
  if (patientId) {
    params.set("patientId", patientId);
  }
  const query = params.toString();
  return `${SPECIALIST_WEB_ROUTES.reports}/${encodeURIComponent(reportId)}?${query}`;
}

export function buildSpecialistCreateTreatmentPlanPath(patientId, patientName = "") {
  const params = new URLSearchParams();
  if (patientId) {
    params.set("patientId", patientId);
  }
  if (patientName) {
    params.set("patientName", patientName);
  }
  const query = params.toString();
  return query
    ? `${SPECIALIST_WEB_ROUTES.treatmentPlans}/new?${query}`
    : `${SPECIALIST_WEB_ROUTES.treatmentPlans}/new`;
}

export function buildSpecialistEditTreatmentPlanPath(planId) {
  return `${SPECIALIST_WEB_ROUTES.treatmentPlans}/${encodeURIComponent(planId)}/edit`;
}

export function buildSpecialistExerciseDetailPath(exerciseId) {
  return `${SPECIALIST_WEB_ROUTES.exercises}/${encodeURIComponent(exerciseId)}`;
}

export function buildSpecialistExerciseEditPath(exerciseId) {
  return `${buildSpecialistExerciseDetailPath(exerciseId)}/edit`;
}

export function buildSpecialistCreateExercisePath() {
  return `${SPECIALIST_WEB_ROUTES.exercises}/new`;
}

export function buildSpecialistCaseRequestDetailPath(caseRequestId) {
  return `${SPECIALIST_WEB_ROUTES.caseRequests}/${encodeURIComponent(caseRequestId)}`;
}

export function buildSpecialistProfilePath() {
  return SPECIALIST_WEB_ROUTES.profile;
}

export function buildSpecialistEditProfilePath() {
  return SPECIALIST_WEB_ROUTES.profileEdit;
}

export function buildSpecialistCreateSessionPath(patientId = null, notes = null) {
  const params = new URLSearchParams();
  if (patientId) {
    params.set("patientId", patientId);
  }
  if (notes) {
    params.set("notes", notes);
  }
  const query = params.toString();
  return query
    ? `${SPECIALIST_WEB_ROUTES.sessions}/new?${query}`
    : `${SPECIALIST_WEB_ROUTES.sessions}/new`;
}

export function buildSpecialistSessionsPath(options = null) {
  const normalized = typeof options === "string"
    ? { view: options }
    : (options && typeof options === "object" ? options : {});

  const params = new URLSearchParams();

  if (normalized.view === "calendar") {
    params.set("view", "calendar");
  }

  const filter = typeof normalized.filter === "string"
    ? normalized.filter.trim().toLowerCase()
    : "";
  if (filter && filter !== "all") {
    params.set("filter", filter);
  }

  const query = params.toString();
  return query
    ? `${SPECIALIST_WEB_ROUTES.sessions}?${query}`
    : SPECIALIST_WEB_ROUTES.sessions;
}

/**
 * Resolves a registered specialist route path from a nav/route key.
 * @param {string|null|undefined} routeKey
 */
export function getSpecialistRoutePath(routeKey) {
  if (!routeKey || typeof routeKey !== "string") {
    return null;
  }

  return SPECIALIST_WEB_ROUTES[routeKey] ?? null;
}

/**
 * Returns true when the path is a registered specialist web route.
 * @param {string|null|undefined} path
 */
export function isImplementedSpecialistPath(path) {
  if (!path || typeof path !== "string") {
    return false;
  }

  const pathname = path.split("?")[0];
  if (IMPLEMENTED_SPECIALIST_PATHS.has(pathname)) {
    return true;
  }

  return pathname.startsWith(`${SPECIALIST_WEB_ROUTES.messages}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.patients}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.caseRequests}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.reviews}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.reports}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.sessions}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.exercises}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.treatmentPlans}/`)
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.supportRequests}/`)
    || pathname === SPECIALIST_WEB_ROUTES.profile
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.profile}/`);
}

/**
 * Resolves the active sidebar nav id from the current pathname.
 * Progress is not a sidebar item, so it returns no active highlight.
 * @param {string|null|undefined} pathname
 */
export function resolveSpecialistSidebarActiveId(pathname) {
  if (!pathname || typeof pathname !== "string") {
    return "dashboard";
  }

  if (pathname === SPECIALIST_WEB_ROUTES.dashboard) {
    return "dashboard";
  }

  if (pathname.startsWith(SPECIALIST_WEB_ROUTES.progress)) {
    return SPECIALIST_NO_SIDEBAR_ACTIVE;
  }

  for (const matcher of SIDEBAR_ACTIVE_ROUTE_MATCHERS) {
    if (pathname === matcher.prefix || pathname.startsWith(`${matcher.prefix}/`)) {
      return matcher.navId;
    }
  }

  return "dashboard";
}
