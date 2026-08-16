import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildSessionHubAreaOptions } from "../../utils/parentSessionsUtils";

export function SessionsHubAreas({ activeArea, onChange, sessionCount, requestCount }) {
  const { t } = useLocale();
  const areas = useMemo(() => buildSessionHubAreaOptions(t), [t]);

  return (
    <div className="pd-task-hub-tabs" role="tablist" aria-label={t("parent.sessions.hubAreasAriaLabel")}>
      {areas.map((area) => {
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
