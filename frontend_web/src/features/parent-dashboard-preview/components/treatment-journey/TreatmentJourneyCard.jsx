import { ChevronRight, TrendingUp } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  formatTreatmentJourneyPercent,
  journeyHasData,
  treatmentJourneyPreviewScores,
  treatmentJourneyTrendClass,
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

function localizedTrendLabel(trend, t) {
  switch (String(trend || "").trim().toLowerCase()) {
    case "improving":
      return t("parent.progress.trendImproving");
    case "declining":
      return t("parent.progress.trendNeedsAttention");
    case "stable":
    default:
      return t("parent.progress.trendStable");
  }
}

function localizedScoreChange(scoreChange, t) {
  if (scoreChange == null || !Number.isFinite(scoreChange)) {
    return "—";
  }

  const rounded = Math.round(scoreChange);
  if (rounded > 0) {
    return t("parent.progress.scoreChangePositive", { points: rounded });
  }
  if (rounded < 0) {
    return t("parent.progress.scoreChangeNegative", { points: rounded });
  }
  return t("parent.progress.scoreChangeZero");
}

function TrendBadge({ trend, t }) {
  return (
    <span className={`pd-tj-trend-badge ${treatmentJourneyTrendClass(trend)}`}>
      {localizedTrendLabel(trend, t)}
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

function ErrorBody({ onRetry, t }) {
  return (
    <div className="pd-tj-card-body pd-tj-card-body-error">
      <p>{t("parent.progress.loadError")}</p>
      {onRetry ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          {t("common.retry")}
        </button>
      ) : null}
    </div>
  );
}

function EmptyBody({ t }) {
  return (
    <div className="pd-tj-card-body pd-tj-card-body-empty">
      <TrendingUp size={22} aria-hidden="true" />
      <p>{t("parent.progress.emptyMessage")}</p>
    </div>
  );
}

function CompactSummaryMetric({ label, value, emphasized = false, trend = null, t }) {
  return (
    <div className={emphasized ? "pd-tj-card-summary-metric is-primary" : "pd-tj-card-summary-metric"}>
      <span className="pd-tj-metric-label">{label}</span>
      <strong>{value}</strong>
      {trend ? <TrendBadge trend={trend} t={t} /> : null}
    </div>
  );
}

function LoadedBody({ journey, t }) {
  const previewScores = buildSparklineScores(journey);

  return (
    <div className="pd-tj-card-body pd-tj-card-body-loaded">
      <div className="pd-tj-card-visual-block">
        <div className="pd-tj-card-summary-grid">
          <CompactSummaryMetric
            label={t("parent.progress.startedAt")}
            value={formatTreatmentJourneyPercent(journey.startingScore)}
            t={t}
          />
          <CompactSummaryMetric
            label={t("parent.progress.currentProgress")}
            value={formatTreatmentJourneyPercent(journey.currentScore)}
            trend={journey.trend}
            emphasized
            t={t}
          />
          <CompactSummaryMetric
            label={t("parent.progress.scoreChange")}
            value={localizedScoreChange(journey.scoreChange, t)}
            t={t}
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
  const { t } = useLocale();
  const hasData = journeyHasData(journey);
  const summaryLabel = (() => {
    if (isLoading) {
      return t("parent.progress.semanticsLoading");
    }

    if (error) {
      return t("parent.progress.semanticsError");
    }

    if (!hasData) {
      return t("parent.progress.semanticsEmpty");
    }

    const current = journey?.currentScore != null ? Math.round(journey.currentScore) : 0;
    return t("parent.progress.semanticsLoaded", {
      score: current,
      trend: localizedTrendLabel(journey.trend, t),
    });
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
              <h2 className="pd-section-title">{t("parent.progress.title")}</h2>
              <button
                type="button"
                className="pd-link pd-tj-card-view-details"
                onClick={handleViewDetails}
              >
                {t("parent.progress.viewDetails")}
                <ChevronRight size={16} aria-hidden="true" className="pd-tj-card-view-details-icon" />
              </button>
            </div>
            <p className="pd-section-sub">{t("parent.progress.subtitle")}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="pd-tj-card-interactive"
        onClick={onTap}
        aria-label={t("parent.progress.openDetailsAria", { summary: summaryLabel })}
      >
        {isLoading ? <LoadingBody /> : null}
        {!isLoading && error ? <ErrorBody onRetry={onRetry} t={t} /> : null}
        {!isLoading && !error && !hasData ? <EmptyBody t={t} /> : null}
        {!isLoading && !error && hasData ? <LoadedBody journey={journey} t={t} /> : null}
      </button>
    </section>
  );
}
