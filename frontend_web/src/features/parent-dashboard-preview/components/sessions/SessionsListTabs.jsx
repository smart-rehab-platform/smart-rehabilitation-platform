import { SESSION_LIST_TABS } from "../../utils/parentSessionsUtils";

export function SessionsListTabs({ activeTab, onChange, counts }) {
  return (
    <div className="pd-sessions-subtabs" role="tablist" aria-label="Session lists">
      {SESSION_LIST_TABS.map((tab) => (
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
          <span className="pd-task-hub-tab-count">{counts[tab.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
