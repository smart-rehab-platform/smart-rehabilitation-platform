import { HUB_TASK_TABS } from "../../utils/parentDailyTasksUtils";

export function TaskTabs({ activeTab, onChange, counts = {} }) {
  return (
    <div className="pd-task-hub-tabs" role="tablist" aria-label="Exercise lists">
      {HUB_TASK_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`pd-task-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`pd-task-panel-${tab.id}`}
            className={`pd-task-hub-tab${isActive ? " is-active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {typeof count === "number" ? (
              <span className="pd-task-hub-tab-count">{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
