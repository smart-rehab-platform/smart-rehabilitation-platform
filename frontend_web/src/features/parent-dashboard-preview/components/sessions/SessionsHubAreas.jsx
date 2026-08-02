import { SESSION_HUB_AREAS } from "../../utils/parentSessionsUtils";

export function SessionsHubAreas({ activeArea, onChange, sessionCount, requestCount }) {
  return (
    <div className="pd-task-hub-tabs" role="tablist" aria-label="Sessions hub areas">
      {SESSION_HUB_AREAS.map((area) => {
        const count = area.id === "sessions" ? sessionCount : requestCount;
        return (
          <button
            key={area.id}
            type="button"
            role="tab"
            id={`pd-sessions-area-${area.id}`}
            aria-selected={activeArea === area.id}
            aria-controls={`pd-sessions-panel-${area.id}`}
            className={`pd-task-hub-tab${activeArea === area.id ? " is-active" : ""}`}
            onClick={() => onChange(area.id)}
          >
            {area.label}
            <span className="pd-task-hub-tab-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
