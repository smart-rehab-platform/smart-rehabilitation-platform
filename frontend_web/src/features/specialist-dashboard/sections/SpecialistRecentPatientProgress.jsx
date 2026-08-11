import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";

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
  return (
    <section
      className="pd-card pd-card-pad pd-specialist-preview-card"
      aria-label="Recent patient progress"
    >
      <PreviewCardHeader
        title="Recent Patient Progress"
        subtitle="Latest progress across your active cases"
        actionLabel="View All"
        onAction={onViewAll}
      />

      {isLoading ? (
        <p className="pd-inline-loading pd-specialist-preview-loading">Loading patient progress...</p>
      ) : error ? (
        <div className="pd-specialist-preview-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : progressItems.length === 0 ? (
        <p className="pd-specialist-preview-empty">No patient progress available yet.</p>
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
