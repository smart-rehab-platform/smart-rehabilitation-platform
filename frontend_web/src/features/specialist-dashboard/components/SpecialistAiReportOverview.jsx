import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import {
  getAiReportConfidenceLabel,
  getAiReportPriorityLabel,
  getAiReportPriorityTone,
} from "../utils/specialistReportsLocalization";

export function SpecialistAiReportOverview({ overview, reportTypeLabel }) {
  const { t } = useLocale();

  if (!overview) {
    return null;
  }

  const priorityLabel = getAiReportPriorityLabel(overview.priorityLevel, t);
  const priorityTone = getAiReportPriorityTone(overview.priorityLevel);
  const confidenceLabel = getAiReportConfidenceLabel(overview.confidencePercent, t);
  const showOverview = Boolean(reportTypeLabel || priorityLabel || confidenceLabel || overview.usedFallback);

  if (!showOverview) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-ai-report-overview">
      <h3 className="pd-specialist-review-section-title">
        {t("specialist.reports.details.ai.overview")}
      </h3>

      <div className="pd-specialist-ai-report-overview-top">
        {reportTypeLabel ? (
          <StatusBadge label={reportTypeLabel} tone="blue" />
        ) : null}
        {overview.usedFallback ? (
          <StatusBadge
            label={t("specialist.reports.details.ai.fallbackBadge")}
            tone="gray"
          />
        ) : null}
      </div>

      <dl className="pd-specialist-ai-report-overview-metrics">
        {priorityLabel ? (
          <div>
            <dt>{t("specialist.reports.details.ai.priority")}</dt>
            <dd>
              <StatusBadge label={priorityLabel} tone={priorityTone} />
            </dd>
          </div>
        ) : null}
        {confidenceLabel ? (
          <div>
            <dt>{t("specialist.reports.details.ai.confidence")}</dt>
            <dd>{confidenceLabel}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
