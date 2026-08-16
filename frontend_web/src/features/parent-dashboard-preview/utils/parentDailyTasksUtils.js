import {
  buildHubSortOptions,
  buildHubStatusFilterOptions,
  buildHubTaskTabOptions,
  getHubEmptyMessages,
  getTaskHubActionLabel,
  getTaskStatusLabel,
  getTaskStatusMeta,
  getTaskStatusTone,
} from "./parentDailyTasksLocalization";

export {
  buildHubSortOptions,
  buildHubStatusFilterOptions,
  buildHubTaskTabOptions,
  getHubEmptyMessages,
  getTaskHubActionLabel,
  getTaskStatusLabel,
  getTaskStatusMeta,
  getTaskStatusTone,
};

const ACTIONABLE_RANK = {
  needs_retry: 0,
  todo: 1,
  submitted: 2,
  reviewed: 3,
};

/**
 * @param {Array<Record<string, unknown>>} tasks
 * @param {{ search?: string, childId?: string, status?: string }} filters
 */
export function filterHubTasks(tasks, filters) {
  const search = filters.search?.trim().toLowerCase() || "";
  const childId = filters.childId || "all";
  const status = filters.status || "all";

  return tasks.filter((task) => {
    if (childId !== "all" && task.patientId !== childId) {
      return false;
    }

    if (status !== "all" && task.status !== status) {
      return false;
    }

    if (search && !String(task.title || "").toLowerCase().includes(search)) {
      return false;
    }

    return true;
  });
}

function compareDueDates(left, right) {
  const leftMs = left.dueDateMs;
  const rightMs = right.dueDateMs;

  if (leftMs == null && rightMs == null) {
    return 0;
  }

  if (leftMs == null) {
    return 1;
  }

  if (rightMs == null) {
    return -1;
  }

  return leftMs - rightMs;
}

/**
 * @param {Array<Record<string, unknown>>} tasks
 * @param {string} sortKey
 */
export function sortHubTasks(tasks, sortKey) {
  const copy = [...tasks];

  if (sortKey === "dueDate") {
    return copy.sort((left, right) => {
      const dueCompare = compareDueDates(left, right);
      if (dueCompare !== 0) {
        return dueCompare;
      }

      return String(left.title).localeCompare(String(right.title));
    });
  }

  if (sortKey === "newest") {
    return copy.sort((left, right) => {
      const leftMs = left.createdAtMs ?? 0;
      const rightMs = right.createdAtMs ?? 0;
      if (leftMs !== rightMs) {
        return rightMs - leftMs;
      }

      return String(left.title).localeCompare(String(right.title));
    });
  }

  if (sortKey === "alphabetical") {
    return copy.sort((left, right) => String(left.title).localeCompare(String(right.title)));
  }

  return copy.sort((left, right) => {
    const leftRank = ACTIONABLE_RANK[left.status] ?? 99;
    const rightRank = ACTIONABLE_RANK[right.status] ?? 99;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    const dueCompare = compareDueDates(left, right);
    if (dueCompare !== 0) {
      return dueCompare;
    }

    return String(left.title).localeCompare(String(right.title));
  });
}
