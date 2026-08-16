/**
 * Localized "feature not available on web" messages for parent navigation.
 * @param {(key: string, params?: Record<string, unknown>) => string} t
 */
export function buildParentNavUnavailable(t) {
  return {
    aiAssistant: t("parent.routes.unavailable.aiAssistant"),
    dailyTasks: t("parent.routes.unavailable.dailyTasks"),
    exerciseDetails: t("parent.routes.unavailable.exerciseDetails"),
    sessions: t("parent.routes.unavailable.sessions"),
    sessionDetails: t("parent.routes.unavailable.sessionDetails"),
    feedback: t("parent.routes.unavailable.feedback"),
    profile: t("parent.routes.unavailable.profile"),
    summary: t("parent.routes.unavailable.summary"),
    generic: t("parent.routes.unavailable.generic"),
  };
}
