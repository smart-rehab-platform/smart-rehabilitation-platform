import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { useLocale } from "../../../context/useLocale.js";

function PreviewCardHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="pd-card-header">
      <div>
        <h2 className="pd-section-title">{title}</h2>
        <p className="pd-section-sub">{subtitle}</p>
      </div>
      <button type="button" className="pd-link" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export function SpecialistRecentPatientProgress({
  progressItems = [],
  isLoading = false,
  error = null,
  onRetry,
  onViewAll,
}) {
  const { t } = useLocale();

  return (
    <section
      className="pd-card pd-card-pad pd-specialist-preview-card"
      aria-label={t("specialist.dashboard.progress.ariaLabel")}
    >
      <PreviewCardHeader
        title={t("specialist.dashboard.progress.title")}
        subtitle={t("specialist.dashboard.progress.subtitle")}
        actionLabel={t("specialist.dashboard.viewAll")}
        onAction={onViewAll}
      />

      {isLoading ? (
        <p className="pd-inline-loading pd-specialist-preview-loading">{t("specialist.dashboard.progress.loading")}</p>
      ) : error ? (
        <div className="pd-specialist-preview-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            {t("common.retry")}
          </button>
        </div>
      ) : progressItems.length === 0 ? (
        <p className="pd-specialist-preview-empty">{t("specialist.dashboard.progress.empty")}</p>
      ) : (
        <div className="pd-specialist-progress-list">
          {progressItems.map((item) => (
            <ProgressBar
              key={item.patientId}
              label={item.patientName}
              percent={item.percent}
              tone="cyan"
            />
          ))}
        </div>
      )}
    </section>
  );
}
