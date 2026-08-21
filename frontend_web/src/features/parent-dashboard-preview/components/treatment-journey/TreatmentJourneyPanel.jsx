import { LineChart, RefreshCw } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildJourneyPeriodOptions,
  buildTreatmentJourneyInterpretation,
  formatTreatmentJourneyDisplayDate,
  formatTreatmentJourneyPercent,
  formatTreatmentJourneyScoreChange,
  getJourneyPeriodLabel,
  getTreatmentJourneyTrendLabel,
  journeyHasData,
  treatmentJourneyTrendClass,
} from "../../utils/parentTreatmentJourneyUtils";
import { TreatmentJourneyChart } from "./TreatmentJourneyChart";

function JourneyPeriodSelector({ selectedPeriod, onSelected, disabled = false, t }) {
  const options = buildJourneyPeriodOptions(t);

  return (
    <div
      className="pd-tj-period-selector"
      role="tablist"
      aria-label={t("parent.treatmentJourney.periodSelectorAria")}
    >
      {options.map((option) => {
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

function SummaryMetric({ label, value, trend, trendLabel, emphasized = false }) {
  return (
    <div className={emphasized ? "pd-tj-summary-metric is-primary" : "pd-tj-summary-metric"}>
      <span className="pd-tj-metric-label">{label}</span>
      <strong>{value}</strong>
      {trend ? (
        <span className={`pd-tj-trend-badge ${treatmentJourneyTrendClass(trend)}`}>
          {trendLabel}
        </span>
      ) : null}
    </div>
  );
}

function JourneySummarySection({ journey, child, t, locale }) {
  const trend = journey?.trend ?? "stable";

  const childName = child?.fullName || t("parent.common.child");
  const firstName = childName.split(" ")[0] || t("parent.common.child");
  const avatarAlt = child?.fullName
    ? `${child.fullName} profile photo`
    : t("parent.treatmentJourney.childPhotoAlt");

  return (
    <section className="pd-card pd-card-pad pd-tj-summary" aria-label={t("parent.treatmentJourney.summaryAria")}>
      <div className="pd-tj-summary-grid">
        <div className="pd-tj-summary-identity">
          {child?.profileImageUrl ? (
            <img
              src={child.profileImageUrl}
              alt={avatarAlt}
              className="pd-avatar pd-avatar-photo pd-tj-panel-avatar pd-tj-summary-avatar"
            />
          ) : (
            <span className="pd-avatar pd-tj-panel-avatar pd-tj-summary-avatar" aria-hidden="true">
              {(child?.fullName || "C").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <h3 className="pd-section-title">{t("parent.progress.title")}</h3>
            <p className="pd-section-sub">
              {t("parent.treatmentJourney.subtitleNamed", { name: firstName })}
            </p>
          </div>
        </div>
        <SummaryMetric
          label={t("parent.treatmentJourney.startedAt")}
          value={formatTreatmentJourneyPercent(journey?.startingScore, { t, locale })}
        />
        <SummaryMetric
          label={t("parent.treatmentJourney.currentProgress")}
          value={formatTreatmentJourneyPercent(journey?.currentScore, { t, locale })}
          trend={trend}
          trendLabel={getTreatmentJourneyTrendLabel(trend, t)}
          emphasized
        />
        <SummaryMetric
          label={t("parent.treatmentJourney.scoreChange")}
          value={formatTreatmentJourneyScoreChange(journey?.scoreChange, t)}
        />
      </div>
    </section>
  );
}

function JourneyErrorBanner({ message, onRetry, t }) {
  return (
    <div className="pd-inline-error-banner pd-tj-error-banner" role="alert">
      <p className="pd-inline-error">{message || t("parent.treatmentJourney.loadFailedDefault")}</p>
      {onRetry ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          {t("parent.common.retry")}
        </button>
      ) : null}
    </div>
  );
}

function JourneyInterpretationCard({ journey, t }) {
  const interpretation = buildTreatmentJourneyInterpretation(journey, t);

  return (
    <section className="pd-card pd-card-pad pd-tj-interpretation" aria-label={t("parent.treatmentJourney.interpretationAria")}>
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

function TreatmentPeriodInfo({ journey, period, t, locale }) {
  const startLabel = formatTreatmentJourneyDisplayDate(journey?.treatmentStart, locale, t);
  const endLabel = formatTreatmentJourneyDisplayDate(journey?.treatmentEnd, locale, t);
  const emptyDisplay = t("parent.common.emptyDisplay");

  if (startLabel === emptyDisplay && endLabel === emptyDisplay) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-tj-period-info" aria-label={t("parent.treatmentJourney.periodInfoAria")}>
      <h3 className="pd-section-title">{t("parent.treatmentJourney.treatmentPeriod")}</h3>
      <dl className="pd-tj-period-info-list">
        <div>
          <dt>{t("parent.treatmentJourney.periodStart")}</dt>
          <dd>{startLabel}</dd>
        </div>
        <div>
          <dt>{t("parent.treatmentJourney.periodEnd")}</dt>
          <dd>{endLabel}</dd>
        </div>
        <div>
          <dt>{t("parent.treatmentJourney.selectedView")}</dt>
          <dd>{getJourneyPeriodLabel(period, t)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function TreatmentJourneyPanel({
  child,
  hasMultipleChildren = false,
  childOptions = [],
  selectedChildId,
  onChildChange,
  journey,
  period,
  isLoading,
  isPeriodLoading,
  isRefreshing,
  error,
  onPeriodChange,
  onRetry,
  onRefresh,
  supportingSections = null,
}) {
  const { t, locale } = useLocale();
  const hasData = journeyHasData(journey);
  const showInitialSkeleton = isLoading && !journey;

  return (
    <div className="pd-tj-panel pd-section-enter">
      <div className="pd-tj-controls-row" role="region">
        <div className="pd-tj-controls-group">
          {hasMultipleChildren ? (
            <div className="pd-progress-filter pd-tj-child-filter">
              <label htmlFor="pd-progress-child-filter">{t("parent.common.child")}</label>
              <select
                id="pd-progress-child-filter"
                className="pd-select"
                value={selectedChildId || ""}
                onChange={onChildChange}
              >
                {childOptions.map((childOption) => (
                  <option key={childOption.id} value={childOption.id}>
                    {childOption.fullName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <JourneyPeriodSelector
            selectedPeriod={period}
            onSelected={onPeriodChange}
            disabled={isLoading && !journey}
            t={t}
          />
        </div>

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-btn-sm pd-tj-refresh-btn"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          aria-label={t("parent.treatmentJourney.refreshAria")}
        >
          <RefreshCw size={16} aria-hidden="true" className={isRefreshing ? "is-spinning" : ""} />
          {t("parent.treatmentJourney.refresh")}
        </button>
      </div>

      {error ? <JourneyErrorBanner message={error} onRetry={onRetry} t={t} /> : null}

      {showInitialSkeleton ? (
        <JourneySummarySkeleton />
      ) : (
        <JourneySummarySection journey={journey} child={child} t={t} locale={locale} />
      )}

      <section className="pd-card pd-card-pad pd-tj-chart-card">
        <TreatmentJourneyChart
          points={journey?.chartPoints ?? []}
          period={period}
          isLoading={isPeriodLoading && Boolean(journey)}
        />
      </section>

      {!hasData && !showInitialSkeleton && !error ? (
        <p className="pd-tj-empty-copy">{t("parent.treatmentJourney.emptyProgress")}</p>
      ) : null}

      {supportingSections}
      <JourneyInterpretationCard journey={journey} t={t} />
      <TreatmentPeriodInfo journey={journey} period={period} t={t} locale={locale} />
    </div>
  );
}
