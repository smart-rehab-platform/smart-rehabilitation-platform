import { LineChart, RefreshCw } from "lucide-react";
import {
  JOURNEY_PERIOD_OPTIONS,
  buildTreatmentJourneyInterpretation,
  formatTreatmentJourneyDisplayDate,
  formatTreatmentJourneyPercent,
  formatTreatmentJourneyScoreChange,
  journeyHasData,
  journeyPeriodLabel,
  treatmentJourneyTrendClass,
  treatmentJourneyTrendLabel,
} from "../../utils/parentTreatmentJourneyUtils";
import { TreatmentJourneyChart } from "./TreatmentJourneyChart";

function JourneyPeriodSelector({ selectedPeriod, onSelected, disabled = false }) {
  return (
    <div
      className="pd-tj-period-selector"
      role="tablist"
      aria-label="Treatment journey period"
    >
      {JOURNEY_PERIOD_OPTIONS.map((option) => {
        const isSelected = option.value === selectedPeriod;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={isSelected ? "pd-tj-period-option is-selected" : "pd-tj-period-option"}
            onClick={() => onSelected(option.value)}
            disabled={disabled}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function JourneySummarySkeleton() {
  return (
    <div className="pd-tj-summary pd-tj-summary-skeleton" aria-hidden="true">
      <div className="pd-tj-card-skeleton pd-tj-card-skeleton-line" />
      <div className="pd-tj-card-skeleton pd-tj-card-skeleton-line" />
    </div>
  );
}

function SummaryMetric({ label, value, trend, emphasized = false }) {
  return (
    <div className={emphasized ? "pd-tj-summary-metric is-primary" : "pd-tj-summary-metric"}>
      <span className="pd-tj-metric-label">{label}</span>
      <strong>{value}</strong>
      {trend ? (
        <span className={`pd-tj-trend-badge ${treatmentJourneyTrendClass(trend)}`}>
          {treatmentJourneyTrendLabel(trend)}
        </span>
      ) : null}
    </div>
  );
}

function JourneySummarySection({ journey }) {
  const trend = journey?.trend ?? "stable";

  return (
    <section className="pd-card pd-card-pad pd-tj-summary" aria-label="Treatment journey summary">
      <div className="pd-tj-summary-grid">
        <SummaryMetric
          label="Started At"
          value={formatTreatmentJourneyPercent(journey?.startingScore)}
        />
        <SummaryMetric
          label="Current Progress"
          value={formatTreatmentJourneyPercent(journey?.currentScore)}
          trend={trend}
          emphasized
        />
        <SummaryMetric
          label="Score Change"
          value={formatTreatmentJourneyScoreChange(journey?.scoreChange)}
        />
      </div>
    </section>
  );
}

function JourneyErrorBanner({ message, onRetry }) {
  return (
    <div className="pd-inline-error-banner pd-tj-error-banner" role="alert">
      <p className="pd-inline-error">{message || "Couldn't load the treatment journey."}</p>
      {onRetry ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

function JourneyInterpretationCard({ journey }) {
  const interpretation = buildTreatmentJourneyInterpretation(journey);

  return (
    <section className="pd-card pd-card-pad pd-tj-interpretation" aria-label="Treatment journey interpretation">
      <div className="pd-tj-interpretation-heading">
        <span className="pd-tj-interpretation-icon" aria-hidden="true">
          <LineChart size={18} />
        </span>
        <h3 className="pd-section-title">{interpretation.title}</h3>
      </div>
      <p className="pd-section-sub">{interpretation.body}</p>
    </section>
  );
}

function TreatmentPeriodInfo({ journey, period }) {
  const startLabel = formatTreatmentJourneyDisplayDate(journey?.treatmentStart);
  const endLabel = formatTreatmentJourneyDisplayDate(journey?.treatmentEnd);

  if (startLabel === "—" && endLabel === "—") {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-tj-period-info" aria-label="Treatment period information">
      <h3 className="pd-section-title">Treatment Period</h3>
      <dl className="pd-tj-period-info-list">
        <div>
          <dt>Start</dt>
          <dd>{startLabel}</dd>
        </div>
        <div>
          <dt>End</dt>
          <dd>{endLabel}</dd>
        </div>
        <div>
          <dt>Selected view</dt>
          <dd>{journeyPeriodLabel(period)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function TreatmentJourneyPanel({
  child,
  hasMultipleChildren = false,
  journey,
  period,
  isLoading,
  isPeriodLoading,
  isRefreshing,
  error,
  onPeriodChange,
  onRetry,
  onRefresh,
}) {
  const hasData = journeyHasData(journey);
  const showInitialSkeleton = isLoading && !journey;
  const childName = child?.fullName || "Treatment Journey";
  const avatarAlt = child?.fullName
    ? `${child.fullName}'s profile photo`
    : "Child profile photo";

  return (
    <div className="pd-tj-panel pd-section-enter">
      <header className="pd-tj-panel-header">
        <div className="pd-tj-panel-identity">
          {child?.profileImageUrl ? (
            <img
              src={child.profileImageUrl}
              alt={avatarAlt}
              className="pd-avatar pd-avatar-photo pd-tj-panel-avatar"
            />
          ) : (
            <span className="pd-avatar pd-tj-panel-avatar" aria-hidden="true">
              {(child?.fullName || "C").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <h2 className="pd-section-title">
              {hasMultipleChildren ? "Treatment Journey" : childName}
            </h2>
            <p className="pd-section-sub">
              {hasMultipleChildren
                ? `See how ${childName.split(" ")[0] || "your child"}'s progress has changed over time`
                : "See how your child's progress has changed over time"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="pd-btn pd-btn-soft pd-tj-refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh treatment journey"
        >
          <RefreshCw size={16} aria-hidden="true" className={isRefreshing ? "is-spinning" : ""} />
          Refresh
        </button>
      </header>

      <JourneyPeriodSelector
        selectedPeriod={period}
        onSelected={onPeriodChange}
        disabled={isLoading && !journey}
      />

      {error ? <JourneyErrorBanner message={error} onRetry={onRetry} /> : null}

      {showInitialSkeleton ? <JourneySummarySkeleton /> : <JourneySummarySection journey={journey} />}

      <TreatmentJourneyChart
        points={journey?.chartPoints ?? []}
        period={period}
        isLoading={isPeriodLoading && Boolean(journey)}
      />

      {!hasData && !showInitialSkeleton && !error ? (
        <p className="pd-tj-empty-copy">Progress will appear after exercises are reviewed.</p>
      ) : null}

      <JourneyInterpretationCard journey={journey} />
      <TreatmentPeriodInfo journey={journey} period={period} />
    </div>
  );
}
