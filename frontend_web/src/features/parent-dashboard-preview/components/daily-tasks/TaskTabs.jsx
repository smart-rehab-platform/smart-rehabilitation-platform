import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildHubTaskTabOptions } from "../../utils/parentDailyTasksUtils";

export function TaskTabs({ activeTab, onChange, counts = {} }) {
  const { t } = useLocale();
  const tabs = useMemo(() => buildHubTaskTabOptions(t), [t]);

  return (
    <div
      className="pd-tj-period-selector"
      role="tablist"
      aria-label={t("parent.exercises.title")}
    >
      {tabs.map((tab) => {
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
            className={isActive ? "pd-tj-period-option is-selected" : "pd-tj-period-option"}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {typeof count === "number" ? (
              <span className="pd-daily-tasks-tab-count">{count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
