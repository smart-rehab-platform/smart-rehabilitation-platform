/**
 * Builds localized parent sidebar navigation items.
 * Nav item ids are stable; labels come from parent.nav.* and shared nav.* keys.
 * @param {(key: string, params?: Record<string, unknown>) => string} t
 */
export function buildParentNavItems(t) {
  return [
    { id: "dashboard", label: t("parent.nav.home"), icon: "layoutDashboard" },
    { id: "children", label: t("parent.nav.myChildren"), icon: "users" },
    { id: "cases", label: t("parent.nav.caseRequests"), icon: "clipboardList" },
    { id: "exercises", label: t("parent.nav.exercises"), icon: "activity" },
    { id: "progress", label: t("parent.nav.progress"), icon: "trendingUp" },
    { id: "sessions", label: t("parent.nav.sessions"), icon: "calendar" },
    { id: "reports", label: t("parent.nav.reports"), icon: "fileText" },
    { id: "feedback", label: t("parent.nav.feedback"), icon: "messageCircle" },
    { id: "reportSpecialist", label: t("parent.nav.reportSpecialist"), icon: "complaint" },
    { id: "myComplaints", label: t("parent.nav.myComplaints"), icon: "history" },
    { id: "messages", label: t("nav.messages"), icon: "messageSquare", badgeKey: "messages" },
    { id: "ai", label: t("parent.nav.aiAssistant"), icon: "sparkles" },
    { id: "notifications", label: t("nav.notifications"), icon: "notifications", badgeKey: "notifications" },
    { id: "profile", label: t("nav.profile"), icon: "user" },
  ];
}
