import { ChevronRight, TrendingUp } from "lucide-react";
import {
  formatTreatmentJourneyPercent,
  formatTreatmentJourneyScoreChange,
  journeyHasData,
  treatmentJourneyPreviewScores,
  treatmentJourneyTrendClass,
  treatmentJourneyTrendLabel,
} from "../../utils/parentTreatmentJourneyUtils";
import { TreatmentJourneySparkline } from "./TreatmentJourneySparkline";

function buildSparklineScores(journey) {
  const fromPoints = treatmentJourneyPreviewScores(journey.chartPoints, 8);

  if (fromPoints.length >= 2) {
    return fromPoints;
  }

  const starting = journey.startingScore;
  const current = journey.currentScore;

  if (starting != null && current != null) {
    return [starting, current];
  }

  return fromPoints;
}

function TrendBadge({ trend }) {
  return (
    <span className={`pd-tj-trend-badge ${treatmentJourneyTrendClass(trend)}`}>
      {treatmentJourneyTrendLabel(trend)}
    </span>
  );
}

function LoadingBody() {
  return (
    <div className="pd-tj-card-body pd-tj-card-body-loading" aria-live="polite">
      <div className="pd-tj-card-visual-block">
        <div className="pd-tj-card-summary-grid">
          <div className="pd-tj-card-skeleton pd-tj-card-skeleton-metric" />
          <div className="pd-tj-card-skeleton pd-tj-card-skeleton-metric" />
          <div className="pd-tj-card-skeleton pd-tj-card-skeleton-metric" />
        </div>
        <div className="pd-tj-card-skeleton pd-tj-card-skeleton-chart" />
      </div>
    </div>
  );
}

function ErrorBody({ onRetry }) {
  return (
    <div className="pd-tj-card-body pd-tj-card-body-error">
      <p>Couldn&apos;t load treatment progress.</p>
      {onRetry ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

function EmptyBody() {
  return (
    <div className="pd-tj-card-body pd-tj-card-body-empty">
      <TrendingUp size={22} aria-hidden="true" />
      <p>Progress will appear after exercises are reviewed.</p>
    </div>
  );
}

function CompactSummaryMetric({ label, value, emphasized = false, trend = null }) {
  return (
    <div className={emphasized ? "pd-tj-card-summary-metric is-primary" : "pd-tj-card-summary-metric"}>
      <span className="pd-tj-metric-label">{label}</span>
      <strong>{value}</strong>
      {trend ? <TrendBadge trend={trend} /> : null}
    </div>
  );
}

function LoadedBody({ journey }) {
  const previewScores = buildSparklineScores(journey);

  return (
    <div className="pd-tj-card-body pd-tj-card-body-loaded">
      <div className="pd-tj-card-visual-block">
        <div className="pd-tj-card-summary-grid">
          <CompactSummaryMetric
            label="Started At"
            value={formatTreatmentJourneyPercent(journey.startingScore)}
          />
          <CompactSummaryMetric
            label="Current Progress"
            value={formatTreatmentJourneyPercent(journey.currentScore)}
            trend={journey.trend}
            emphasized
          />
          <CompactSummaryMetric
            label="Score Change"
            value={formatTreatmentJourneyScoreChange(journey.scoreChange)}
          />
        </div>
        <TreatmentJourneySparkline scores={previewScores} />
      </div>
    </div>
  );
}

export function TreatmentJourneyCard({
  journey,
  isLoading = false,
  error = null,
  onTap,
  onRetry,
}) {
  const hasData = journeyHasData(journey);
  const summaryLabel = (() => {
    if (isLoading) {
      return "Treatment Journey, loading progress";
    }

    if (error) {
      return "Treatment Journey, could not load treatment progress";
    }

    if (!hasData) {
      return "Treatment Journey, progress will appear after exercises are reviewed";
    }

    const current = journey?.currentScore != null ? Math.round(journey.currentScore) : 0;
    return `Treatment Journey, current progress ${current} percent, ${treatmentJourneyTrendLabel(journey.trend)}`;
  })();

  const handleViewDetails = (event) => {
    event.stopPropagation();
    onTap?.();
  };

  return (
    <section
      className="pd-card pd-card-pad pd-tj-card pd-section-enter"
      aria-label={summaryLabel}
    >
      <div className="pd-tj-card-header">
        <div className="pd-tj-card-heading">
          <span className="pd-tj-card-icon" aria-hidden="true">
            <TrendingUp size={18} />
          </span>
          <div className="pd-tj-card-heading-text">
            <div className="pd-tj-card-title-row">
              <h2 className="pd-section-title">Treatment Journey</h2>
              <button
                type="button"
                className="pd-link pd-tj-card-view-details"
                onClick={handleViewDetails}
              >
                View details
                <ChevronRight size={16} aria-hidden="true" className="pd-tj-card-view-details-icon" />
              </button>
            </div>
            <p className="pd-section-sub">Progress throughout the treatment period</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="pd-tj-card-interactive"
        onClick={onTap}
        aria-label={`${summaryLabel}. Open treatment journey details.`}
      >
        {isLoading ? <LoadingBody /> : null}
        {!isLoading && error ? <ErrorBody onRetry={onRetry} /> : null}
        {!isLoading && !error && !hasData ? <EmptyBody /> : null}
        {!isLoading && !error && hasData ? <LoadedBody journey={journey} /> : null}
      </button>
    </section>
  );
}
