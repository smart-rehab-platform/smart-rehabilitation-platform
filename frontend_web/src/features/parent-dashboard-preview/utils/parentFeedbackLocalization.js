import { translateKey } from "./parentLocalizationCore.js";

export const FEEDBACK_SORT_VALUES = ["newest", "oldest", "alphabetical", "retryFirst"];
export const FEEDBACK_STATUS_FILTER_VALUES = ["all", "needs_retry", "reviewed"];

export function buildFeedbackSortOptions(t) {
  return [
    { id: "newest", label: translateKey(t, "parent.feedback.sort.newest", "Newest review") },
    { id: "oldest", label: translateKey(t, "parent.feedback.sort.oldest", "Oldest review") },
    { id: "alphabetical", label: translateKey(t, "parent.common.sort.alphabetical", "Alphabetical") },
    { id: "retryFirst", label: translateKey(t, "parent.feedback.sort.retryFirst", "Requires retry first") },
  ];
}

export function buildFeedbackStatusFilterOptions(t) {
  return [
    { id: "all", label: translateKey(t, "parent.common.filters.allStatuses", "All statuses") },
    { id: "needs_retry", label: translateKey(t, "parent.dailyTasks.status.needsRetry", "Needs Retry") },
    { id: "reviewed", label: translateKey(t, "parent.dailyTasks.status.reviewed", "Reviewed") },
  ];
}

export function getFeedbackEmptyMessages(t) {
  return {
    none: translateKey(t, "parent.feedback.empty.none", "No exercise feedback yet."),
    filtered: translateKey(
      t,
      "parent.feedback.empty.filtered",
      "No reviews match your search or selected child.",
    ),
  };
}

const FEEDBACK_STATUS_TONES = {
  needs_retry: "danger",
  reviewed: "purple",
  submitted: "success",
  todo: "gray",
};

export function getFeedbackStatusMeta(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return {
    label: translateKey(
      t,
      normalized === "needs_retry"
        ? "parent.dailyTasks.status.needsRetry"
        : normalized === "reviewed"
          ? "parent.dailyTasks.status.reviewed"
          : normalized === "submitted"
            ? "parent.dailyTasks.status.submitted"
            : "parent.dailyTasks.status.todo",
      normalized === "needs_retry"
        ? "Needs Retry"
        : normalized === "reviewed"
          ? "Reviewed"
          : normalized === "submitted"
            ? "Submitted"
            : "To Do",
    ),
    tone: FEEDBACK_STATUS_TONES[normalized] || "gray",
  };
}

/** @deprecated Use buildFeedbackSortOptions(t) */
export const FEEDBACK_SORT_OPTIONS = buildFeedbackSortOptions(null);

/** @deprecated Use buildFeedbackStatusFilterOptions(t) */
export const FEEDBACK_STATUS_FILTER_OPTIONS = buildFeedbackStatusFilterOptions(null);

/** @deprecated Use getFeedbackEmptyMessages(t) */
export const FEEDBACK_EMPTY_MESSAGES = getFeedbackEmptyMessages(null);
