/**
 * Parent dashboard routes registered in frontend_web App.jsx.
 */
export const PARENT_WEB_ROUTES = {
  dashboard: "/dashboard/parent",
  exerciseDetails: "/dashboard/parent/exercise-details",
  dailyTasks: "/dashboard/parent/daily-tasks",
  feedback: "/dashboard/parent/feedback",
  sessions: "/dashboard/parent/sessions",
  reports: "/dashboard/parent/reports",
  notifications: "/dashboard/parent/notifications",
  aiAssistant: "/dashboard/parent/ai-assistant",
  profile: "/dashboard/parent/profile",
  children: "/dashboard/parent/children",
  progress: "/dashboard/parent/progress",
  caseRequests: "/dashboard/parent/case-requests",
  messages: "/dashboard/parent/messages",
  login: "/login",
};

/** Maps sidebar nav item ids to PARENT_WEB_ROUTES keys (dashboard uses PARENT_WEB_ROUTES). */
export const SIDEBAR_NAV_ROUTE_KEYS = {
  dashboard: "dashboard",
  children: "children",
  cases: "caseRequests",
  exercises: "dailyTasks",
  progress: "progress",
  sessions: "sessions",
  reports: "reports",
  feedback: "feedback",
  messages: "messages",
  ai: "aiAssistant",
  notifications: "notifications",
  profile: "profile",
};

export const PARENT_NAV_UNAVAILABLE = {
  aiAssistant: "AI Assistant is not available on web yet.",
  dailyTasks: "Daily tasks are not available on web yet.",
  exerciseDetails: "Exercise details are not available on web yet.",
  sessions: "Sessions are not available on web yet.",
  sessionDetails: "Session details are not available on web yet.",
  feedback: "Feedback details are not available on web yet.",
  profile: "Profile is not available on web yet.",
  summary: "This section is not available on web yet.",
  generic: "This feature is not available on web yet.",
};

/**
 * Returns true when the path is a registered parent web route.
 * @param {string|null|undefined} path
 */
export function isImplementedParentPath(path) {
  if (!path || typeof path !== "string") {
    return false;
  }

  const pathname = path.split("?")[0];

  if (Object.values(PARENT_WEB_ROUTES).includes(pathname)) {
    return true;
  }

  if (pathname.startsWith(`${PARENT_WEB_ROUTES.reports}/`)) {
    return true;
  }

  if (pathname.startsWith(`${PARENT_WEB_ROUTES.aiAssistant}/`)) {
    return true;
  }

  if (pathname.startsWith(`${PARENT_WEB_ROUTES.children}/`)) {
    return true;
  }

  if (pathname.startsWith(`${PARENT_WEB_ROUTES.caseRequests}/`)) {
    return true;
  }

  if (pathname.startsWith(`${PARENT_WEB_ROUTES.messages}/`)) {
    return true;
  }

  return pathname === PARENT_WEB_ROUTES.progress;
}

/**
 * Builds the exercise details path for an assigned exercise task row.
 * @param {{ id?: string, patientId?: string, exerciseId?: string|null }} task
 */
export function buildParentExerciseDetailsPath(task) {
  if (!task?.id || !task?.patientId) {
    return null;
  }

  const params = new URLSearchParams({
    assignedExerciseId: task.id,
    patientId: task.patientId,
  });

  if (task.exerciseId) {
    params.set("exerciseId", task.exerciseId);
  }

  return `${PARENT_WEB_ROUTES.exerciseDetails}?${params.toString()}`;
}

/**
 * Builds the parent daily tasks path with optional child filter.
 * @param {string|null|undefined} childId
 */
export function buildParentDailyTasksPath(childId) {
  if (!childId || childId === "all") {
    return PARENT_WEB_ROUTES.dailyTasks;
  }

  const params = new URLSearchParams({ childId });
  return `${PARENT_WEB_ROUTES.dailyTasks}?${params.toString()}`;
}

/**
 * Builds the parent feedback path with optional child filter.
 * @param {string|null|undefined} childId
 */
export function buildParentFeedbackPath(childId) {
  if (!childId || childId === "all") {
    return PARENT_WEB_ROUTES.feedback;
  }

  const params = new URLSearchParams({ childId });
  return `${PARENT_WEB_ROUTES.feedback}?${params.toString()}`;
}

/**
 * Builds the parent sessions path with optional child filter.
 * @param {string|null|undefined} childId
 */
export function buildParentSessionsPath(childId) {
  if (!childId || childId === "all") {
    return PARENT_WEB_ROUTES.sessions;
  }

  const params = new URLSearchParams({ childId });
  return `${PARENT_WEB_ROUTES.sessions}?${params.toString()}`;
}

/**
 * Builds the parent reports path with optional child filter.
 * @param {string|null|undefined} childId
 */
export function buildParentReportsPath(childId) {
  if (!childId || childId === "all") {
    return PARENT_WEB_ROUTES.reports;
  }

  const params = new URLSearchParams({ childId });
  return `${PARENT_WEB_ROUTES.reports}?${params.toString()}`;
}

/**
 * Builds the parent report detail path.
 * @param {string|null|undefined} reportId
 */
export function buildParentReportDetailPath(reportId) {
  if (!reportId) {
    return null;
  }

  return `${PARENT_WEB_ROUTES.reports}/${encodeURIComponent(reportId)}`;
}

/**
 * Builds the parent child detail path.
 * @param {string|null|undefined} childId
 */
export function buildParentChildDetailPath(childId) {
  if (!childId) {
    return null;
  }

  return `${PARENT_WEB_ROUTES.children}/${encodeURIComponent(childId)}`;
}

/**
 * Builds the parent progress path with optional child filter.
 * @param {string|null|undefined} childId
 */
export function buildParentProgressPath(childId) {
  if (!childId || childId === "all") {
    return PARENT_WEB_ROUTES.progress;
  }

  const params = new URLSearchParams({ childId });
  return `${PARENT_WEB_ROUTES.progress}?${params.toString()}`;
}

/**
 * Builds the parent case requests list path.
 */
export function buildParentCaseRequestsPath() {
  return PARENT_WEB_ROUTES.caseRequests;
}

/**
 * Builds the parent new case request form path.
 */
export function buildParentCaseRequestNewPath() {
  return `${PARENT_WEB_ROUTES.caseRequests}/new`;
}

/**
 * Builds the parent case request detail path.
 * @param {string|null|undefined} requestId
 */
export function buildParentCaseRequestDetailPath(requestId) {
  if (!requestId) {
    return null;
  }

  return `${PARENT_WEB_ROUTES.caseRequests}/${encodeURIComponent(requestId)}`;
}

/**
 * Builds the parent case request edit path.
 * @param {string|null|undefined} requestId
 */
export function buildParentCaseRequestEditPath(requestId) {
  if (!requestId) {
    return null;
  }

  return `${PARENT_WEB_ROUTES.caseRequests}/${encodeURIComponent(requestId)}/edit`;
}

/**
 * Builds the parent AI assistant path with optional child and conversation context.
 * @param {string|null|undefined} childId
 * @param {string|null|undefined} conversationId
 */
export function buildParentAiAssistantPath(childId, conversationId = null) {
  const base = conversationId
    ? `${PARENT_WEB_ROUTES.aiAssistant}/${encodeURIComponent(conversationId)}`
    : PARENT_WEB_ROUTES.aiAssistant;

  if (!childId) {
    return base;
  }

  const params = new URLSearchParams({ childId });
  return `${base}?${params.toString()}`;
}

/**
 * Builds the parent messages path with optional conversation id.
 * @param {string|null|undefined} conversationId
 */
export function buildParentMessagesPath(conversationId = null) {
  if (!conversationId) {
    return PARENT_WEB_ROUTES.messages;
  }

  return `${PARENT_WEB_ROUTES.messages}/${encodeURIComponent(conversationId)}`;
}

/** Maps the current pathname to a sidebar nav item id for active highlighting. */
export function resolveParentSidebarActiveId(pathname) {
  if (!pathname || typeof pathname !== "string") {
    return "dashboard";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.aiAssistant)) {
    return "ai";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.messages)) {
    return "messages";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.children)) {
    return "children";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.caseRequests)) {
    return "cases";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.progress)) {
    return "progress";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.feedback)) {
    return "feedback";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.sessions)) {
    return "sessions";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.reports)) {
    return "reports";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.notifications)) {
    return "notifications";
  }

  if (pathname.startsWith(PARENT_WEB_ROUTES.profile)) {
    return "profile";
  }

  if (
    pathname.startsWith(PARENT_WEB_ROUTES.dailyTasks)
    || pathname.startsWith(PARENT_WEB_ROUTES.exerciseDetails)
  ) {
    return "exercises";
  }

  if (pathname === PARENT_WEB_ROUTES.dashboard) {
    return "dashboard";
  }

  return "dashboard";
}
