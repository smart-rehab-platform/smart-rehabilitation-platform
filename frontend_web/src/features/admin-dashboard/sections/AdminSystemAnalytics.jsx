import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { AdminSystemActivityChart } from "../components/AdminSystemActivityChart";
import { AdminSystemActivityPeriodControls } from "../components/AdminSystemActivityPeriodControls";
import { getAdminAnalyticsLabels } from "../utils/adminDashboardLocalization.js";

export function AdminSystemAnalytics({
  activity,
  periodLabel,
  weekOffset,
  isLoading = false,
  error = null,
  canGoForward = false,
  onPreviousWeek,
  onNextWeek,
  onPresetSelected,
  onRetry,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminAnalyticsLabels(t), [t]);

  return (
    <section
      className="pd-card pd-card-pad pd-admin-analytics pd-section-enter"
      aria-label={labels.sectionAriaLabel}
    >
      <div className="pd-admin-analytics-header">
        <h2 className="pd-section-title">{labels.title}</h2>
        <AdminSystemActivityPeriodControls
          periodLabel={periodLabel}
          selectedWeekOffset={weekOffset}
          canGoForward={canGoForward}
          isLoading={isLoading}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
          onPresetSelected={onPresetSelected}
        />
      </div>

      {error ? (
        <div className="pd-admin-section-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            {labels.retry}
          </button>
        </div>
      ) : (
        <AdminSystemActivityChart
          days={activity?.days ?? []}
          periodKey={`week-${weekOffset}-${activity?.weekStart?.toISOString?.() ?? "empty"}`}
          isLoading={isLoading}
        />
      )}
    </section>
  );
}
