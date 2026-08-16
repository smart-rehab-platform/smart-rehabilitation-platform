export const ADMIN_RECENT_USERS_SECTION_ID = "admin-recent-users";

/** @typedef {{ kind: "route", routeKey: string, navOptions?: { role?: string } }} AdminSummaryRouteAction */
/** @typedef {{ kind: "scroll", targetId: string }} AdminSummaryScrollAction */
/** @typedef {AdminSummaryRouteAction | AdminSummaryScrollAction} AdminSummaryKpiAction */

/** @type {Record<string, AdminSummaryKpiAction>} */
export const ADMIN_SUMMARY_KPI_ACTIONS = {
  totalUsers: { kind: "route", routeKey: "users" },
  totalPatients: { kind: "route", routeKey: "patients" },
  totalSpecialists: {
    kind: "route",
    routeKey: "users",
    navOptions: { role: "specialist" },
  },
  newSignupsThisWeek: {
    kind: "scroll",
    targetId: ADMIN_RECENT_USERS_SECTION_ID,
  },
};

/**
 * @param {string|null|undefined} cardKey
 * @returns {AdminSummaryKpiAction|null}
 */
export function getAdminSummaryKpiAction(cardKey) {
  if (!cardKey || typeof cardKey !== "string") {
    return null;
  }

  return ADMIN_SUMMARY_KPI_ACTIONS[cardKey] ?? null;
}

/**
 * @param {string} sectionId
 * @returns {boolean}
 */
export function scrollToAdminDashboardSection(sectionId) {
  if (typeof document === "undefined") {
    return false;
  }

  const node = document.getElementById(sectionId);
  if (!node) {
    return false;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });

  return true;
}
