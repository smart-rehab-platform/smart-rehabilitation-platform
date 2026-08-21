import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

function reviewTone(rawStatus) {
  if (rawStatus === "reviewed") {
    return "success";
  }
  if (rawStatus === "needs_retry") {
    return "warning";
  }
  return "success";
}

export function SpecialistRecentSubmissions({
  submissions,
  onReviewExercises,
  onSubmissionClick,
}) {
  const { t } = useLocale();

  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-submissions">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">{t("specialist.patientDetails.recentSubmissions")}</h2>
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onReviewExercises}>
          {t("specialist.patientDetails.reviewExercises")}
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">{t("specialist.patientDetails.noSubmissions")}</p>
        </div>
      ) : (
        <ul className="pd-specialist-patient-item-list">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <button
                type="button"
                className="pd-card pd-card-pad pd-specialist-patient-list-row pd-specialist-patient-list-row-btn"
                onClick={() => onSubmissionClick?.(submission)}
                disabled={!submission.id || !onSubmissionClick}
              >
                <div>
                  <strong dir="auto">{submission.exerciseTitle}</strong>
                  <p className="pd-section-sub">
                    {[submission.mediaTypeLabel, submission.submittedAtLabel].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="pd-specialist-patient-list-row-aside">
                  <StatusBadge
                    label={submission.reviewStatus}
                    tone={reviewTone(submission.reviewStatusRaw)}
                  />
                  <ChevronRight size={16} aria-hidden="true" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
