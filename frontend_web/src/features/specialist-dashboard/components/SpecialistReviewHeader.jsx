import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { useLocale } from "../../../context/useLocale";

export function SpecialistReviewHeader({ submission }) {
  const { t } = useLocale();

  if (!submission) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-review-header">
      <div className="pd-specialist-review-summary-grid">
        <div className="pd-specialist-review-summary-item">
          <span className="pd-specialist-review-summary-label">{t("specialist.reviews.labels.patient")}</span>
          <p className="pd-specialist-review-patient-name" dir="auto">{submission.patientName}</p>
        </div>
        <div className="pd-specialist-review-summary-item">
          <span className="pd-specialist-review-summary-label">{t("specialist.reviews.labels.exercise")}</span>
          <p className="pd-specialist-review-exercise-title" dir="auto">{submission.exerciseTitle}</p>
        </div>
        <div className="pd-specialist-review-summary-item">
          <span className="pd-specialist-review-summary-label">{t("specialist.reviews.labels.submitted")}</span>
          <p className="pd-specialist-review-submitted-at">{submission.submittedAtLabel}</p>
        </div>
        <div className="pd-specialist-review-summary-badge">
          <StatusBadge label={submission.statusLabel} tone={submission.statusTone} />
        </div>
      </div>
    </section>
  );
}
