import { SYSTEM_ACTIVITY_PRESET_OFFSETS } from "../utils/adminDashboardMappers";

const PRESET_OPTIONS = [
  { label: "This Week", value: SYSTEM_ACTIVITY_PRESET_OFFSETS.thisWeek },
  { label: "Last Week", value: SYSTEM_ACTIVITY_PRESET_OFFSETS.lastWeek },
  { label: "Last 2 Weeks", value: SYSTEM_ACTIVITY_PRESET_OFFSETS.last2Weeks },
  { label: "Last Month", value: SYSTEM_ACTIVITY_PRESET_OFFSETS.lastMonth },
];

export function AdminSystemActivityPeriodControls({
  periodLabel,
  selectedWeekOffset,
  canGoForward = false,
  isLoading = false,
  onPreviousWeek,
  onNextWeek,
  onPresetSelected,
}) {
  const handlePresetChange = (event) => {
    const nextOffset = Number.parseInt(event.target.value, 10);
    if (Number.isFinite(nextOffset) && nextOffset !== selectedWeekOffset) {
      onPresetSelected?.(nextOffset);
    }
  };

  const presetValue = PRESET_OPTIONS.some((option) => option.value === selectedWeekOffset)
    ? String(selectedWeekOffset)
    : "";

  return (
    <div className="pd-admin-period-controls">
      <button
        type="button"
        className="pd-admin-period-nav"
        aria-label="Previous week"
        disabled={isLoading}
        onClick={onPreviousWeek}
      >
        ‹
      </button>

      <label className="pd-admin-period-select-wrap">
        <span className="pd-sr-only">Select period</span>
        {isLoading ? (
          <span className="pd-admin-period-loading" aria-hidden="true" />
        ) : null}
        <select
          className="pd-admin-period-select"
          value={presetValue}
          disabled={isLoading}
          onChange={handlePresetChange}
          aria-label="System activity period"
        >
          <option value="" disabled hidden>
            {periodLabel}
          </option>
          {PRESET_OPTIONS.map((option) => (
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
        aria-label="Next week"
        disabled={!canGoForward || isLoading}
        onClick={onNextWeek}
      >
        ›
      </button>
    </div>
  );
}
