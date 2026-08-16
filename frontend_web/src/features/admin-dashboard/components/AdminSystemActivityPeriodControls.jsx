import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getAdminAnalyticsLabels,
  getAdminAnalyticsPeriodOptions,
} from "../utils/adminDashboardLocalization.js";

export function AdminSystemActivityPeriodControls({
  periodLabel,
  selectedWeekOffset,
  canGoForward = false,
  isLoading = false,
  onPreviousWeek,
  onNextWeek,
  onPresetSelected,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminAnalyticsLabels(t), [t]);
  const presetOptions = useMemo(() => getAdminAnalyticsPeriodOptions(t), [t]);

  const handlePresetChange = (event) => {
    const nextOffset = Number.parseInt(event.target.value, 10);
    if (Number.isFinite(nextOffset) && nextOffset !== selectedWeekOffset) {
      onPresetSelected?.(nextOffset);
    }
  };

  const presetValue = presetOptions.some((option) => option.value === selectedWeekOffset)
    ? String(selectedWeekOffset)
    : "";

  return (
    <div className="pd-admin-period-controls">
      <button
        type="button"
        className="pd-admin-period-nav"
        aria-label={labels.previousWeek}
        disabled={isLoading}
        onClick={onPreviousWeek}
      >
        ‹
      </button>

      <label className="pd-admin-period-select-wrap">
        <span className="pd-sr-only">{labels.selectPeriod}</span>
        {isLoading ? (
          <span className="pd-admin-period-loading" aria-hidden="true" />
        ) : null}
        <select
          className="pd-admin-period-select"
          value={presetValue}
          disabled={isLoading}
          onChange={handlePresetChange}
          aria-label={labels.periodAriaLabel}
        >
          <option value="" disabled hidden>
            {periodLabel}
          </option>
          {presetOptions.map((option) => (
            <option key={option.value} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pd-admin-period-label" aria-hidden="true">
          {periodLabel}
        </span>
      </label>

      <button
        type="button"
        className="pd-admin-period-nav"
        aria-label={labels.nextWeek}
        disabled={!canGoForward || isLoading}
        onClick={onNextWeek}
      >
        ›
      </button>
    </div>
  );
}
