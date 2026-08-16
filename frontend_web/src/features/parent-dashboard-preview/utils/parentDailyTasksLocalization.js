import { translateKey } from "./parentLocalizationCore.js";

export const HUB_TASK_TAB_VALUES = ["daily", "weekly", "assigned"];
export const HUB_SORT_VALUES = ["actionable", "dueDate", "newest", "alphabetical"];
export const HUB_STATUS_FILTER_VALUES = ["all", "todo", "needs_retry", "submitted", "reviewed"];

const TASK_STATUS_KEY_BY_VALUE = {
  todo: "parent.dailyTasks.status.todo",
  needs_retry: "parent.dailyTasks.status.needsRetry",
  submitted: "parent.dailyTasks.status.submitted",
  reviewed: "parent.dailyTasks.status.reviewed",
};

const EN_TASK_STATUS = {
  todo: "To Do",
  needs_retry: "Needs Retry",
  submitted: "Submitted",
  reviewed: "Reviewed",
};

const TASK_STATUS_TONES = {
  todo: "gray",
  needs_retry: "danger",
  submitted: "success",
  reviewed: "purple",
};

export function getTaskStatusLabel(status, t = null) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  const key = TASK_STATUS_KEY_BY_VALUE[normalized];
  if (key) {
    return translateKey(t, key, EN_TASK_STATUS[normalized]);
  }
  return normalized.replace(/_/g, " ");
}

export function getTaskStatusTone(status) {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return TASK_STATUS_TONES[normalized] || "gray";
}

export function getTaskStatusMeta(status, t = null) {
  return {
    label: getTaskStatusLabel(status, t),
    tone: getTaskStatusTone(status),
  };
}

export function buildHubTaskTabOptions(t) {
  return [
    { id: "daily", label: translateKey(t, "parent.dailyTasks.tabs.daily", "Daily") },
    { id: "weekly", label: translateKey(t, "parent.dailyTasks.tabs.weekly", "Weekly") },
    { id: "assigned", label: translateKey(t, "parent.dailyTasks.tabs.assigned", "Assigned") },
  ];
}

export function buildHubSortOptions(t) {
  return [
    { id: "actionable", label: translateKey(t, "parent.dailyTasks.sort.actionable", "Most actionable") },
    { id: "dueDate", label: translateKey(t, "parent.dailyTasks.sort.dueDate", "Due date") },
    { id: "newest", label: translateKey(t, "parent.dailyTasks.sort.newest", "Newest assigned") },
    { id: "alphabetical", label: translateKey(t, "parent.common.sort.alphabetical", "Alphabetical") },
  ];
}

export function buildHubStatusFilterOptions(t) {
  return [
    { id: "all", label: translateKey(t, "parent.common.filters.allStatuses", "All statuses") },
    ...["todo", "needs_retry", "submitted", "reviewed"].map((id) => ({
      id,
      label: getTaskStatusLabel(id, t),
    })),
  ];
}

export function getTaskHubActionLabel(status, t = null) {
  if (status === "needs_retry") {
    return translateKey(t, "parent.dailyTasks.action.resume", "Resume Exercise");
  }

  if (status === "submitted" || status === "reviewed") {
    return translateKey(t, "parent.dailyTasks.action.viewDetails", "View Details");
  }

  return translateKey(t, "parent.dailyTasks.action.open", "Open Exercise");
}

export function getHubEmptyMessages(t) {
  return {
    daily: translateKey(t, "parent.dailyTasks.empty.daily", "No daily exercises."),
    weekly: translateKey(t, "parent.dailyTasks.empty.weekly", "No weekly exercises."),
    assigned: translateKey(t, "parent.dailyTasks.empty.assigned", "No assigned exercises."),
    filtered: translateKey(t, "parent.dailyTasks.empty.filtered", "No exercises match the current filters."),
  };
}

/** @deprecated Use buildHubTaskTabOptions(t) */
export const HUB_TASK_TABS = buildHubTaskTabOptions(null);

/** @deprecated Use buildHubSortOptions(t) */
export const HUB_SORT_OPTIONS = buildHubSortOptions(null);

/** @deprecated Use buildHubStatusFilterOptions(t) */
export const HUB_STATUS_FILTER_OPTIONS = buildHubStatusFilterOptions(null);

/** @deprecated Use getHubEmptyMessages(t) */
export const HUB_EMPTY_MESSAGES = getHubEmptyMessages(null);
