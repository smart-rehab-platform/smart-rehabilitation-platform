import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function SpecialistReviewHeader({ submission }) {
  if (!submission) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-review-header">
      <div className="pd-specialist-review-summary-grid">
        <div className="pd-specialist-review-summary-item">
          <span className="pd-specialist-review-summary-label">Patient</span>
          <p className="pd-specialist-review-patient-name">{submission.patientName}</p>
        </div>
        <div className="pd-specialist-review-summary-item">
          <span className="pd-specialist-review-summary-label">Exercise</span>
          <p className="pd-specialist-review-exercise-title">{submission.exerciseTitle}</p>
        </div>
        <div className="pd-specialist-review-summary-item">
          <span className="pd-specialist-review-summary-label">Submitted</span>
          <p className="pd-specialist-review-submitted-at">{submission.submittedAtLabel}</p>
        </div>
        <div className="pd-specialist-review-summary-badge">
          <StatusBadge label={submission.statusLabel} tone={submission.statusTone} />
        </div>
      </div>
    </section>
  );
}
