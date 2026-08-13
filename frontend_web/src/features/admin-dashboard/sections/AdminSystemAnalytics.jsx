import { AdminSystemActivityChart } from "../components/AdminSystemActivityChart";
import { AdminSystemActivityPeriodControls } from "../components/AdminSystemActivityPeriodControls";

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
  return (
    <section
      className="pd-card pd-card-pad pd-admin-analytics pd-section-enter"
      aria-label="System Analytics"
    >
      <div className="pd-admin-analytics-header">
        <h2 className="pd-section-title">System Analytics</h2>
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
            Retry
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
