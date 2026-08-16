import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useLocale } from "../../../context/useLocale.js";
import {
  PARENT_WEB_ROUTES,
  SIDEBAR_NAV_ROUTE_KEYS,
  buildParentAiAssistantPath,
  buildParentCaseRequestsPath,
  buildParentChildDetailPath,
  buildParentDailyTasksPath,
  buildParentExerciseDetailsPath,
  buildParentFeedbackPath,
  buildParentProgressPath,
  buildParentReportDetailPath,
  buildParentReportsPath,
  buildParentSessionsPath,
  isImplementedParentPath,
} from "../../../routes/parentDashboardRoutes";
import { buildParentNavUnavailable } from "../utils/parentRouteMessages";
import {
  findActionableExercise,
  isExerciseActionable,
  resolveNotificationRoute,
} from "../utils/parentDashboardMappers";

function buildExerciseDetailsPath(task, patientId) {
  return buildParentExerciseDetailsPath({
    id: task?.id,
    patientId,
    exerciseId: task?.exerciseId,
  });
}

export function useParentDashboardNavigation({
  selectedChildId,
  exercises,
  upcomingSession,
  latestReport,
  markNotificationRead,
  showToast,
  closeMobileNav,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLocale();
  const navUnavailable = useMemo(() => buildParentNavUnavailable(t), [t]);

  const navigateIfImplemented = useCallback((path, unavailableMessage) => {
    if (!isImplementedParentPath(path)) {
      showToast(unavailableMessage || navUnavailable.generic);
      return false;
    }

    navigate(path);
    return true;
  }, [navigate, navUnavailable.generic, showToast]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      navigate(PARENT_WEB_ROUTES.login, { replace: true });
    } catch {
      showToast(t("parent.toast.signOutFailed"));
    }
  }, [logout, navigate, showToast, t]);

  const handleViewProfile = useCallback(() => {
    navigateIfImplemented(PARENT_WEB_ROUTES.profile, navUnavailable.profile);
  }, [navigateIfImplemented, navUnavailable.profile]);

  const handleAskAi = useCallback(() => {
    if (!selectedChildId) {
      showToast(t("parent.toast.selectChildForAi"));
      return;
    }

    navigateIfImplemented(
      buildParentAiAssistantPath(selectedChildId),
      navUnavailable.aiAssistant,
    );
  }, [navigateIfImplemented, navUnavailable.aiAssistant, selectedChildId, showToast, t]);

  const handleStartExercise = useCallback(() => {
    if (!selectedChildId) {
      showToast(t("parent.toast.selectChildForExercise"));
      return;
    }

    const task = findActionableExercise(exercises);
    if (!task) {
      showToast(t("parent.toast.noActionableExercises"));
      return;
    }

    navigateIfImplemented(
      buildExerciseDetailsPath(task, selectedChildId),
      navUnavailable.exerciseDetails,
    );
  }, [exercises, navigateIfImplemented, navUnavailable.exerciseDetails, selectedChildId, showToast, t]);

  const handleExerciseClick = useCallback((task) => {
    if (!selectedChildId) {
      showToast(t("parent.toast.selectChildForExercise"));
      return;
    }

    if (!task?.id) {
      showToast(t("parent.toast.exerciseUnavailable"));
      return;
    }

    if (!isExerciseActionable(task.status)) {
      showToast(t("parent.toast.exerciseAlreadySubmitted"));
      return;
    }

    navigateIfImplemented(
      buildExerciseDetailsPath(task, selectedChildId),
      navUnavailable.exerciseDetails,
    );
  }, [navigateIfImplemented, navUnavailable.exerciseDetails, selectedChildId, showToast, t]);

  const handleViewAllExercises = useCallback(() => {
    navigateIfImplemented(
      buildParentDailyTasksPath(selectedChildId),
      navUnavailable.dailyTasks,
    );
  }, [navigateIfImplemented, navUnavailable.dailyTasks, selectedChildId]);

  const handleSessionViewDetails = useCallback(() => {
    navigateIfImplemented(
      buildParentSessionsPath(selectedChildId),
      navUnavailable.sessions,
    );
  }, [navigateIfImplemented, navUnavailable.sessions, selectedChildId]);

  const handleOpenMeeting = useCallback((session) => {
    const meetingUrl = session?.meetingUrl ?? upcomingSession?.meetingUrl;
    if (!meetingUrl) {
      return;
    }

    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  }, [upcomingSession]);

  const handleLatestUpdatesViewAll = useCallback(() => {
    navigateIfImplemented(
      buildParentReportsPath(selectedChildId),
      navUnavailable.generic,
    );
  }, [navigateIfImplemented, navUnavailable.generic, selectedChildId]);

  const handleLatestUpdateAction = useCallback((item) => {
    if (item.type === "report") {
      if (latestReport?.id) {
        navigateIfImplemented(
          buildParentReportDetailPath(latestReport.id),
          navUnavailable.generic,
        );
        return;
      }

      navigateIfImplemented(
        buildParentReportsPath(selectedChildId),
        navUnavailable.generic,
      );
      return;
    }

    if (item.type === "feedback") {
      navigateIfImplemented(
        buildParentFeedbackPath(selectedChildId),
        navUnavailable.feedback,
      );
    }
  }, [latestReport, navigateIfImplemented, navUnavailable.feedback, navUnavailable.generic, selectedChildId]);

  const handleMessages = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.messages);
  }, [navigate]);

  const handleViewAllNotifications = useCallback(() => {
    navigateIfImplemented(
      PARENT_WEB_ROUTES.notifications,
      navUnavailable.generic,
    );
  }, [navigateIfImplemented, navUnavailable.generic]);

  const handleNotificationSelect = useCallback(async (item) => {
    if (item?.id) {
      await markNotificationRead(item.id);
    }

    const route = resolveNotificationRoute(item);
    if (route && isImplementedParentPath(route)) {
      navigate(route);
      return;
    }

    if (item?.title) {
      showToast(item.title);
    }
  }, [markNotificationRead, navigate, showToast]);

  const handleSummaryNavigate = useCallback((navKey) => {
    if (navKey === "exercises") {
      handleViewAllExercises();
      return;
    }

    if (navKey === "sessions") {
      navigateIfImplemented(
        buildParentSessionsPath(selectedChildId),
        navUnavailable.sessions,
      );
      return;
    }

    if (navKey === "progress") {
      navigate(buildParentProgressPath(selectedChildId));
    }
  }, [handleViewAllExercises, navigate, navigateIfImplemented, navUnavailable.sessions, selectedChildId]);

  const handleHeroViewFull = useCallback(() => {
    if (!selectedChildId) {
      showToast(t("parent.toast.selectChildForDetails"));
      return;
    }

    const path = buildParentChildDetailPath(selectedChildId);
    if (path) {
      navigate(path);
    }
  }, [navigate, selectedChildId, showToast, t]);

  const handleSidebarNav = useCallback((navItemId) => {
    closeMobileNav?.();

    if (navItemId === "dashboard") {
      navigate(PARENT_WEB_ROUTES.dashboard, {
        state: selectedChildId ? { selectedChildId } : undefined,
      });
      return;
    }

    const routeKey = SIDEBAR_NAV_ROUTE_KEYS[navItemId];
    if (!routeKey || routeKey === "dashboard") {
      showToast(navUnavailable.generic);
      return;
    }

    if (routeKey === "aiAssistant") {
      handleAskAi();
      return;
    }

    if (routeKey === "messages") {
      handleMessages();
      return;
    }

    if (routeKey === "notifications") {
      handleViewAllNotifications();
      return;
    }

    if (routeKey === "children") {
      navigate(PARENT_WEB_ROUTES.children);
      return;
    }

    if (routeKey === "caseRequests") {
      navigate(buildParentCaseRequestsPath());
      return;
    }

    if (routeKey === "progress") {
      navigate(buildParentProgressPath(selectedChildId));
      return;
    }

    if (routeKey === "dailyTasks") {
      navigate(buildParentDailyTasksPath(selectedChildId));
      return;
    }

    if (routeKey === "feedback") {
      navigate(buildParentFeedbackPath(selectedChildId));
      return;
    }

    if (routeKey === "complaintNew") {
      navigate(PARENT_WEB_ROUTES.complaintNew);
      return;
    }

    if (routeKey === "complaints") {
      navigate(PARENT_WEB_ROUTES.complaints);
      return;
    }

    if (routeKey === "sessions") {
      navigate(buildParentSessionsPath(selectedChildId));
      return;
    }

    if (routeKey === "reports") {
      navigate(buildParentReportsPath(selectedChildId));
      return;
    }

    if (routeKey === "profile") {
      navigate(PARENT_WEB_ROUTES.profile);
      return;
    }

    const unavailableKey = routeKey in navUnavailable
      ? routeKey
      : "generic";

    navigateIfImplemented(null, navUnavailable[unavailableKey]);
  }, [
    closeMobileNav,
    handleAskAi,
    handleMessages,
    handleViewAllNotifications,
    navigate,
    navigateIfImplemented,
    navUnavailable,
    selectedChildId,
    showToast,
  ]);

  return {
    handleSignOut,
    handleViewProfile,
    handleAskAi,
    handleStartExercise,
    handleExerciseClick,
    handleViewAllExercises,
    handleSessionViewDetails,
    handleOpenMeeting,
    handleLatestUpdatesViewAll,
    handleLatestUpdateAction,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSummaryNavigate,
    handleHeroViewFull,
    handleSidebarNav,
  };
}
