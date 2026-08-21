import {
  buildParentCaseRequestDetailPath,
  buildParentChildDetailPath,
  buildParentComplaintDetailPath,
  buildParentExerciseDetailsPath,
  buildParentFeedbackDetailPath,
  buildParentMessagesPath,
  buildParentReportDetailPath,
  buildParentSessionsPath,
  PARENT_WEB_ROUTES,
} from "../../../routes/parentDashboardRoutes.js";

function normalizeType(type) {
  if (!type || typeof type !== "string") {
    return "default";
  }

  return type.trim().toLowerCase().replace(/-/g, "_");
}

function readId(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isCaseIntakeNotification(type, entityType) {
  return entityType === "case_intake_request" || type.startsWith("case_request_");
}

function isComplaintNotification(type, entityType) {
  return (
    entityType === "complaint"
    || type === "complaint_submitted"
    || type === "complaint_reviewed"
  );
}

/**
 * Resolves a Parent Web destination for a notification using existing routes
 * and the same type/entity metadata the backend and Flutter navigators use.
 *
 * Returns null when no safe Parent Web destination exists (caller should stay put).
 *
 * @param {{
 *   type?: string|null,
 *   relatedEntityType?: string|null,
 *   relatedEntityId?: string|null,
 *   patientId?: string|null,
 * }|null|undefined} notification
 * @returns {string|null}
 */
export function resolveParentNotificationDestination(notification) {
  if (!notification || typeof notification !== "object") {
    return null;
  }

  const type = normalizeType(notification.type);
  const entityType = readId(notification.relatedEntityType).toLowerCase();
  const entityId = readId(notification.relatedEntityId);
  const patientId = readId(notification.patientId);

  if (type === "new_message") {
    const canOpenConversation = Boolean(entityId)
      && (!entityType || entityType === "conversation");
    return canOpenConversation ? buildParentMessagesPath(entityId) : null;
  }

  if (type === "case_request_converted" && entityType === "patient" && entityId) {
    return buildParentChildDetailPath(entityId);
  }

  if (isCaseIntakeNotification(type, entityType)) {
    if (entityId) {
      return buildParentCaseRequestDetailPath(entityId);
    }
    return PARENT_WEB_ROUTES.caseRequests;
  }

  // "Case assessment started" is type=general with case_intake_request entity.
  if (entityType === "case_intake_request" && entityId) {
    return buildParentCaseRequestDetailPath(entityId);
  }

  if (isComplaintNotification(type, entityType)) {
    if (entityId) {
      return buildParentComplaintDetailPath(entityId);
    }
    return PARENT_WEB_ROUTES.complaints;
  }

  if (entityType === "patient" && entityId) {
    return buildParentChildDetailPath(entityId);
  }

  if (entityType === "report" || type === "report_ready") {
    if (entityId) {
      return buildParentReportDetailPath(entityId);
    }
    return PARENT_WEB_ROUTES.reports;
  }

  if (type === "session_request") {
    return `${PARENT_WEB_ROUTES.sessions}?area=requests`;
  }

  if (entityType === "session" || type === "session_reminder") {
    return buildParentSessionsPath(null);
  }

  if (entityType === "exercise_review" || type === "feedback_received") {
    if (entityType === "exercise_review" && entityId && patientId) {
      return buildParentFeedbackDetailPath(entityId, patientId);
    }
    return PARENT_WEB_ROUTES.feedback;
  }

  if (entityType === "assigned_exercise" || type === "exercise_reminder") {
    if (entityId && patientId) {
      return buildParentExerciseDetailsPath({ id: entityId, patientId });
    }
    return PARENT_WEB_ROUTES.dailyTasks;
  }

  // Parent Web has no support-request screens; leave unread-marking to the caller.
  if (
    entityType === "support_request"
    || type === "support_request_submitted"
    || type === "support_request_reply"
    || type === "support_request_status_changed"
  ) {
    return null;
  }

  return null;
}

/**
 * @deprecated Prefer resolveParentNotificationDestination.
 * Kept for existing imports from parentDashboardMappers.
 */
export function resolveNotificationRoute(notification) {
  return resolveParentNotificationDestination(notification);
}
