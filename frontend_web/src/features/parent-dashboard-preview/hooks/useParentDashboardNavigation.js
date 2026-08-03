import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import {
  PARENT_NAV_UNAVAILABLE,
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

  const navigateIfImplemented = useCallback((path, unavailableMessage) => {
    if (!isImplementedParentPath(path)) {
      showToast(unavailableMessage || PARENT_NAV_UNAVAILABLE.generic);
      return false;
    }

    navigate(path);
    return true;
  }, [navigate, showToast]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      navigate(PARENT_WEB_ROUTES.login, { replace: true });
    } catch {
      showToast("Unable to sign out. Please try again.");
    }
  }, [logout, navigate, showToast]);

  const handleViewProfile = useCallback(() => {
    navigateIfImplemented(PARENT_WEB_ROUTES.profile, PARENT_NAV_UNAVAILABLE.profile);
  }, [navigateIfImplemented]);

  const handleAskAi = useCallback(() => {
    if (!selectedChildId) {
      showToast("Select a child to use the AI Assistant.");
      return;
    }

    navigateIfImplemented(
      buildParentAiAssistantPath(selectedChildId),
      PARENT_NAV_UNAVAILABLE.aiAssistant,
    );
  }, [navigateIfImplemented, selectedChildId, showToast]);

  const handleStartExercise = useCallback(() => {
    if (!selectedChildId) {
      showToast("Select a child to start an exercise.");
      return;
    }

    const task = findActionableExercise(exercises);
    if (!task) {
      showToast("No actionable exercises for today.");
      return;
    }

    navigateIfImplemented(
      buildExerciseDetailsPath(task, selectedChildId),
      PARENT_NAV_UNAVAILABLE.exerciseDetails,
    );
  }, [exercises, navigateIfImplemented, selectedChildId, showToast]);

  const handleExerciseClick = useCallback((task) => {
    if (!selectedChildId) {
      showToast("Select a child to view this exercise.");
      return;
    }

    if (!task?.id) {
      showToast("This exercise is unavailable right now.");
      return;
    }

    if (!isExerciseActionable(task.status)) {
      showToast("This exercise has already been submitted or reviewed.");
      return;
    }

    navigateIfImplemented(
      buildExerciseDetailsPath(task, selectedChildId),
      PARENT_NAV_UNAVAILABLE.exerciseDetails,
    );
  }, [navigateIfImplemented, selectedChildId, showToast]);

  const handleViewAllExercises = useCallback(() => {
    navigateIfImplemented(
      buildParentDailyTasksPath(selectedChildId),
      PARENT_NAV_UNAVAILABLE.dailyTasks,
    );
  }, [navigateIfImplemented, selectedChildId]);

  const handleSessionViewDetails = useCallback(() => {
    navigateIfImplemented(
      buildParentSessionsPath(selectedChildId),
      PARENT_NAV_UNAVAILABLE.sessions,
    );
  }, [navigateIfImplemented, selectedChildId]);

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
      PARENT_NAV_UNAVAILABLE.generic,
    );
  }, [navigateIfImplemented, selectedChildId]);

  const handleLatestUpdateAction = useCallback((item) => {
    if (item.type === "report") {
      if (latestReport?.id) {
        navigateIfImplemented(
          buildParentReportDetailPath(latestReport.id),
          PARENT_NAV_UNAVAILABLE.generic,
        );
        return;
      }

      navigateIfImplemented(
        buildParentReportsPath(selectedChildId),
        PARENT_NAV_UNAVAILABLE.generic,
      );
      return;
    }

    if (item.type === "feedback") {
      navigateIfImplemented(
        buildParentFeedbackPath(selectedChildId),
        PARENT_NAV_UNAVAILABLE.feedback,
      );
    }
  }, [latestReport, navigateIfImplemented, selectedChildId]);

  const handleMessages = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.messages);
  }, [navigate]);

  const handleViewAllNotifications = useCallback(() => {
    navigateIfImplemented(
      PARENT_WEB_ROUTES.notifications,
      PARENT_NAV_UNAVAILABLE.generic,
    );
  }, [navigateIfImplemented]);

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

  const handleSummaryNavigate = useCallback((label) => {
    const normalized = label?.toLowerCase() ?? "";

    if (normalized.includes("exercise")) {
      handleViewAllExercises();
      return;
    }

    if (normalized.includes("session")) {
      navigateIfImplemented(
        buildParentSessionsPath(selectedChildId),
        PARENT_NAV_UNAVAILABLE.sessions,
      );
      return;
    }

    if (normalized.includes("progress")) {
      navigate(buildParentProgressPath(selectedChildId));
    }
  }, [handleViewAllExercises, navigate, navigateIfImplemented, selectedChildId]);

  const handleHeroViewFull = useCallback(() => {
    if (!selectedChildId) {
      showToast("Select a child to view details.");
      return;
    }

    const path = buildParentChildDetailPath(selectedChildId);
    if (path) {
      navigate(path);
    }
  }, [navigate, selectedChildId, showToast]);

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
      showToast(PARENT_NAV_UNAVAILABLE.generic);
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

    const unavailableKey = routeKey in PARENT_NAV_UNAVAILABLE
      ? routeKey
      : "generic";

    navigateIfImplemented(null, PARENT_NAV_UNAVAILABLE[unavailableKey]);
  }, [
    closeMobileNav,
    handleAskAi,
    handleMessages,
    handleViewAllNotifications,
    navigate,
    navigateIfImplemented,
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
