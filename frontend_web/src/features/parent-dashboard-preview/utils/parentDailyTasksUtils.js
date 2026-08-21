import {
  buildHubTaskTabOptions,
  getHubEmptyMessages,
  getTaskHubActionLabel,
  getTaskStatusLabel,
  getTaskStatusMeta,
  getTaskStatusTone,
} from "./parentDailyTasksLocalization";

export {
  buildHubTaskTabOptions,
  getHubEmptyMessages,
  getTaskHubActionLabel,
  getTaskStatusLabel,
  getTaskStatusMeta,
  getTaskStatusTone,
};

/**
 * @param {Array<Record<string, unknown>>} tasks
 * @param {{ childId?: string }} filters
 */
export function filterHubTasks(tasks, filters) {
  const childId = filters.childId || "all";

  return tasks.filter((task) => {
    if (childId !== "all" && task.patientId !== childId) {
      return false;
    }

    return true;
  });
}
