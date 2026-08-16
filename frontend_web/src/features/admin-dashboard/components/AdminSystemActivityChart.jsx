import { useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getAdminAnalyticsLabels,
  getAdminWeekdayLabels,
} from "../utils/adminDashboardLocalization.js";
import { normalizeBarHeight } from "../utils/adminDashboardMappers";

function buildDefaultChartDays(locale) {
  const shortLabels = getAdminWeekdayLabels(locale, "short");
  const fullLabels = getAdminWeekdayLabels(locale, "long");

  return shortLabels.map((label, index) => ({
    label,
    fullLabel: fullLabels[index] ?? label,
    activityCount: 0,
  }));
}

function resolveEventLabel(count, labels) {
  return count === 1 ? labels.event : labels.events;
}

function formatDayEvents(day, count, labels) {
  const eventLabel = resolveEventLabel(count, labels);
  return labels.dayEvents(day, count, eventLabel);
}

export function AdminSystemActivityChart({
  days = [],
  periodKey = "current-week",
  isLoading = false,
}) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminAnalyticsLabels(t), [t]);
  const defaultDays = useMemo(() => buildDefaultChartDays(locale), [locale]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const chartDays = days.length === 7 ? days : defaultDays;
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
        <span>{labels.legend}</span>
      </div>

      {activeIndex != null && hasData ? (
        <div className="pd-admin-activity-focus" aria-live="polite">
          <strong>{chartDays[activeIndex].fullLabel}</strong>
          <span>
            {formatDayEvents(
              chartDays[activeIndex].fullLabel,
              values[activeIndex],
              labels,
            )}
          </span>
        </div>
      ) : null}

      <div
        className="pd-admin-activity-bars"
        role="img"
        aria-label={labels.chartAriaLabel}
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
          const dayEventsLabel = formatDayEvents(day.fullLabel, count, labels);

          return (
            <div key={`${periodKey}-${day.label}`} className="pd-admin-activity-col">
              <button
                type="button"
                className={`pd-admin-activity-bar-btn${isSelected ? " is-selected" : ""}`}
                disabled={!hasData || isLoading}
                title={dayEventsLabel}
                aria-label={dayEventsLabel}
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
            <p>{labels.emptyTitle}</p>
            <span>{labels.emptyHint}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="pd-admin-activity-loading" aria-hidden="true">
            <span className="pd-inline-loading">{labels.loadingChart}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
