import { useMemo, useState } from "react";
import { normalizeBarHeight } from "../utils/adminDashboardMappers";

const DEFAULT_DAYS = [
  { label: "Mon", fullLabel: "Monday", activityCount: 0 },
  { label: "Tue", fullLabel: "Tuesday", activityCount: 0 },
  { label: "Wed", fullLabel: "Wednesday", activityCount: 0 },
  { label: "Thu", fullLabel: "Thursday", activityCount: 0 },
  { label: "Fri", fullLabel: "Friday", activityCount: 0 },
  { label: "Sat", fullLabel: "Saturday", activityCount: 0 },
  { label: "Sun", fullLabel: "Sunday", activityCount: 0 },
];

export function AdminSystemActivityChart({
  days = [],
  periodKey = "current-week",
  isLoading = false,
}) {
  const [focusedIndex, setFocusedIndex] = useState(null);

  const chartDays = days.length === 7 ? days : DEFAULT_DAYS;
  const values = chartDays.map((day) => day.activityCount ?? 0);
  const hasData = values.some((value) => value > 0);
  const maxValue = hasData ? Math.max(...values) : 1;

  const normalizedHeights = useMemo(
    () => values.map((value) => normalizeBarHeight(value, maxValue)),
    [values, maxValue],
  );

  const activeIndex = focusedIndex;

  return (
    <div className="pd-admin-activity-chart" aria-busy={isLoading}>
      <div className="pd-admin-activity-legend">
        <span className="pd-admin-activity-dot" aria-hidden="true" />
        <span>System Activity</span>
      </div>

      {activeIndex != null && hasData ? (
        <div className="pd-admin-activity-focus" aria-live="polite">
          <strong>{chartDays[activeIndex].fullLabel}</strong>
          <span>
            {values[activeIndex]}{" "}
            {values[activeIndex] === 1 ? "event" : "events"}
          </span>
        </div>
      ) : null}

      <div
        className="pd-admin-activity-bars"
        role="img"
        aria-label="Weekly system activity chart"
      >
        <div className="pd-admin-activity-grid" aria-hidden="true">
          <span className="pd-admin-activity-grid-line" />
          <span className="pd-admin-activity-grid-line" />
          <span className="pd-admin-activity-grid-line" />
          <span className="pd-admin-activity-grid-line" />
        </div>
        <div className="pd-admin-activity-baseline" aria-hidden="true" />

        {chartDays.map((day, index) => {
          const count = values[index];
          const heightFactor = normalizedHeights[index];
          const isSelected = activeIndex === index;

          return (
            <div key={`${periodKey}-${day.label}`} className="pd-admin-activity-col">
              <button
                type="button"
                className={`pd-admin-activity-bar-btn${isSelected ? " is-selected" : ""}`}
                disabled={!hasData || isLoading}
                title={`${day.fullLabel}: ${count} ${count === 1 ? "event" : "events"}`}
                aria-label={`${day.fullLabel}: ${count} ${count === 1 ? "event" : "events"}`}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex((current) => (current === index ? null : current))}
                onMouseEnter={() => setFocusedIndex(index)}
                onMouseLeave={() => setFocusedIndex(null)}
                onClick={() => setFocusedIndex((current) => (current === index ? null : index))}
              >
                {count > 0 ? (
                  <span className="pd-admin-activity-count" aria-hidden="true">
                    {count}
                  </span>
                ) : (
                  <span className="pd-admin-activity-count is-empty" aria-hidden="true" />
                )}
                <span className="pd-admin-activity-bar-track">
                  <span
                    className="pd-admin-activity-bar-fill"
                    style={{ height: `${heightFactor * 100}%` }}
                  />
                </span>
              </button>
              <span className={`pd-admin-activity-day${isSelected ? " is-selected" : ""}`}>
                {day.label}
              </span>
            </div>
          );
        })}

        {!hasData && !isLoading ? (
          <div className="pd-admin-activity-empty">
            <p>No system activity for this week.</p>
            <span>Try selecting another week.</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="pd-admin-activity-loading" aria-hidden="true">
            <span className="pd-inline-loading">Loading chart...</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
