import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildSessionListTabOptions } from "../../utils/parentSessionsUtils";

export function SessionsListTabs({ activeTab, onChange, counts }) {
  const { t } = useLocale();
  const tabs = useMemo(() => buildSessionListTabOptions(t), [t]);

  return (
    <div className="pd-sessions-subtabs" role="tablist" aria-label={t("parent.sessions.listTabsAriaLabel")}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`pd-sessions-list-tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`pd-sessions-list-panel-${tab.id}`}
          className={`pd-sessions-subtab${activeTab === tab.id ? " is-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          <span className="pd-sessions-subtab-count">{counts[tab.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
