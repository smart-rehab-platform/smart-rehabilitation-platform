/**
 * Specialist dashboard routes registered in frontend_web App.jsx.
 */
export const SPECIALIST_WEB_ROUTES = {
  dashboard: "/dashboard/specialist",
  patients: "/dashboard/specialist/patients",
  reviews: "/dashboard/specialist/reviews",
  sessions: "/dashboard/specialist/sessions",
  treatmentPlans: "/dashboard/specialist/treatment-plans",
  progress: "/dashboard/specialist/progress",
  messages: "/dashboard/specialist/messages",
  notifications: "/dashboard/specialist/notifications",
  reports: "/dashboard/specialist/reports",
  login: "/login",
};

/** Maps sidebar nav item ids to SPECIALIST_WEB_ROUTES keys. */
export const SPECIALIST_SIDEBAR_NAV_ROUTE_KEYS = {
  dashboard: "dashboard",
  patients: "patients",
  exercises: "exercises",
  sessions: "sessions",
  reviews: "reviews",
  treatmentPlans: "treatmentPlans",
  reports: "reports",
  messages: "messages",
  ai: "ai",
  notifications: "notifications",
  profile: "profile",
};

/** Temporary placeholder destinations until feature pages ship. */
export const SPECIALIST_PLACEHOLDER_FEATURES = {
  reviews: { title: "Reviews" },
  sessions: { title: "Sessions" },
  treatmentPlans: { title: "Treatment Plans" },
  progress: { title: "Patient Progress" },
  reports: { title: "Reports" },
  patientGoals: { title: "Manage Goals" },
  assignExercise: { title: "Assign Exercise" },
  aiRecommendations: { title: "AI Recommendations" },
  speechAnalysis: { title: "Speech Analysis" },
};

export const SPECIALIST_NAV_UNAVAILABLE = {
  exercises: "Exercises are not available on web yet.",
  reports: "Reports are not available on web yet.",
  ai: "AI & Insights are not available on web yet.",
  profile: "Profile is not available on web yet.",
  generic: "This feature is not available on web yet.",
};

const IMPLEMENTED_SPECIALIST_PATHS = new Set(
  Object.entries(SPECIALIST_WEB_ROUTES)
    .filter(([key]) => key !== "login")
    .map(([, path]) => path),
);

const SIDEBAR_ACTIVE_ROUTE_MATCHERS = [
  { prefix: SPECIALIST_WEB_ROUTES.patients, navId: "patients" },
  { prefix: SPECIALIST_WEB_ROUTES.reviews, navId: "reviews" },
  { prefix: SPECIALIST_WEB_ROUTES.sessions, navId: "sessions" },
  { prefix: SPECIALIST_WEB_ROUTES.treatmentPlans, navId: "treatmentPlans" },
  { prefix: SPECIALIST_WEB_ROUTES.messages, navId: "messages" },
  { prefix: SPECIALIST_WEB_ROUTES.notifications, navId: "notifications" },
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

export function buildSpecialistPatientDetailPath(patientId) {
  return `${SPECIALIST_WEB_ROUTES.patients}/${encodeURIComponent(patientId)}`;
}

export function buildSpecialistPatientGoalsPath(patientId) {
  return `${buildSpecialistPatientDetailPath(patientId)}/goals`;
}

export function buildSpecialistPatientAiRecommendationsPath(patientId) {
  return `${buildSpecialistPatientDetailPath(patientId)}/ai-recommendations`;
}

export function buildSpecialistPatientSpeechAnalysisPath(patientId) {
  return `${buildSpecialistPatientDetailPath(patientId)}/speech-analysis`;
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
    || pathname.startsWith(`${SPECIALIST_WEB_ROUTES.treatmentPlans}/`);
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
