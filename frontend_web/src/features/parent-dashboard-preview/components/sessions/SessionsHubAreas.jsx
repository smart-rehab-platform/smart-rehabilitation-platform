import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildSessionHubAreaOptions } from "../../utils/parentSessionsUtils";

export function SessionsHubAreas({ activeArea, onChange, sessionCount, requestCount }) {
  const { t } = useLocale();
  const areas = useMemo(() => buildSessionHubAreaOptions(t), [t]);

  return (
    <div
      className="pd-sessions-primary-nav"
      role="tablist"
      aria-label={t("parent.sessions.hubAreasAriaLabel")}
    >
      {areas.map((area) => {
        const count = area.id === "sessions" ? sessionCount : requestCount;
        const isActive = activeArea === area.id;

        return (
          <button
            key={area.id}
            type="button"
            role="tab"
            id={`pd-sessions-area-${area.id}`}
            aria-selected={isActive}
            aria-controls={`pd-sessions-panel-${area.id}`}
            className={`pd-sessions-primary-tab${isActive ? " is-active" : ""}`}
            onClick={() => onChange(area.id)}
          >
            {area.label}
            <span className="pd-sessions-primary-tab-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
