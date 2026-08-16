import {
  formatEmptyDisplay,
  formatParentLongDate,
  formatRelativeSessionDate,
  formatTimeAgo,
  translateKey,
} from "./parentLocalizationCore.js";

export function getDefaultChildLabel(t) {
  return translateKey(t, "parent.common.child", "Child");
}

export function getDefaultParentLabel(t) {
  return translateKey(t, "roles.parent", "Parent");
}

export function getDefaultSpecialistLabel(t) {
  return translateKey(t, "parent.common.specialist", "Specialist");
}

export function getDefaultExerciseLabel(t) {
  return translateKey(t, "parent.common.exercise", "Exercise");
}

export function getActiveTreatmentPlanStatus(t) {
  return translateKey(t, "parent.dashboard.status.activeTreatmentPlan", "Active treatment plan");
}

export function getSessionModeLabel(isOnline, t = null) {
  return isOnline
    ? translateKey(t, "parent.dashboard.sessionMode.online", "Online")
    : translateKey(t, "parent.dashboard.sessionMode.inPerson", "In-person");
}

export function getDueTodayLabel(t) {
  return translateKey(t, "parent.dashboard.dueToday", "Due Today");
}

export function formatTaskDuration(repetitions, t = null) {
  if (repetitions == null) {
    return null;
  }
  return translateKey(t, "parent.dashboard.reps", "{count} reps", { count: repetitions });
}

export function formatFrequencyLabel(frequency, t = null) {
  if (!frequency) {
    return null;
  }
  if (frequency === "one_time") {
    return translateKey(t, "parent.dashboard.frequency.oneTime", "One time");
  }
  const normalized = frequency.trim().toLowerCase();
  const key = `parent.dashboard.frequency.${normalized}`;
  return translateKey(t, key, normalized.charAt(0).toUpperCase() + normalized.slice(1));
}

export function formatImprovementTrend(improvementPercent, t = null) {
  if (improvementPercent == null || improvementPercent === 0) {
    return null;
  }
  const sign = improvementPercent > 0 ? "+" : "";
  return translateKey(
    t,
    "parent.dashboard.improvementTrend",
    "{sign}{percent}% improvement",
    { sign, percent: Math.round(improvementPercent) },
  );
}

export function getNoSessionScheduledLabel(t) {
  return translateKey(t, "parent.dashboard.noSessionScheduled", "No session scheduled");
}

export function getDefaultProgressReportTitle(t) {
  return translateKey(t, "parent.dashboard.defaultProgressReport", "Progress Report");
}

export function getDefaultFeedbackQuote(t) {
  return translateKey(
    t,
    "parent.dashboard.defaultFeedbackQuote",
    "Review available for the latest exercise submission.",
  );
}

export function getExerciseSubmissionStateMessage(status, t = null) {
  if (status === "submitted") {
    return translateKey(
      t,
      "parent.dashboard.exerciseState.submitted",
      "This exercise has been submitted and is awaiting specialist review.",
    );
  }
  if (status === "reviewed") {
    return translateKey(
      t,
      "parent.dashboard.exerciseState.reviewed",
      "This exercise has been reviewed by the specialist.",
    );
  }
  if (status === "needs_retry") {
    return translateKey(
      t,
      "parent.dashboard.exerciseState.needsRetry",
      "The specialist asked for this exercise to be done again. Submit a new recording or notes below.",
    );
  }
  return null;
}

export function getAiDashboardGuidanceMessages(t) {
  return {
    default: translateKey(
      t,
      "parent.dashboard.aiGuidance.default",
      "Ask about exercises, reports, sessions, or home-practice guidance.",
    ),
    pending: translateKey(
      t,
      "parent.dashboard.aiGuidance.pending",
      "You still have exercises to complete today. Ask the assistant for help understanding the instructions.",
    ),
    complete: translateKey(
      t,
      "parent.dashboard.aiGuidance.complete",
      "Today's exercises are complete. Ask the assistant for home-practice guidance.",
    ),
  };
}

export function getSubmissionMediaValidationMessages(t) {
  return {
    unsupportedType: translateKey(
      t,
      "parent.dashboard.submission.unsupportedType",
      "This file type is not supported. Use an image, video, or audio file.",
    ),
    tooLarge: translateKey(
      t,
      "parent.dashboard.submission.tooLarge",
      "File exceeds 50 MB. Choose a smaller file.",
    ),
  };
}

export function formatDisplayDate(value, locale = "en", t = null) {
  return formatParentLongDate(value, locale, t);
}

export function formatSessionDate(value, locale = "en", t = null) {
  return formatRelativeSessionDate(value, locale, t);
}

export function formatNotificationTimeAgo(value, locale = "en", t = null) {
  return formatTimeAgo(value, locale, t) ?? translateKey(t, "parent.common.recently", "Recently");
}

export function formatNotificationTitleFallback(t) {
  return translateKey(t, "parent.notifications.defaultTitle", "Notification");
}

export function formatEmptyDash(t) {
  return formatEmptyDisplay(t);
}
