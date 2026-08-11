import { ChevronRight } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

function reviewTone(status) {
  if (status === "Reviewed") {
    return "success";
  }
  if (status === "Needs retry") {
    return "warning";
  }
  return "blue";
}

export function SpecialistRecentSubmissions({ submissions, onReviewExercises }) {
  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-submissions">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">Recent Exercise Submissions</h2>
        <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onReviewExercises}>
          Review Exercises
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">No recent submissions yet.</p>
        </div>
      ) : (
        <ul className="pd-specialist-patient-item-list">
          {submissions.map((submission) => (
            <li key={submission.id} className="pd-card pd-card-pad pd-specialist-patient-list-row">
              <div>
                <strong>{submission.exerciseTitle}</strong>
                <p className="pd-section-sub">
                  {[submission.mediaTypeLabel, submission.submittedAtLabel].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="pd-specialist-patient-list-row-aside">
                <StatusBadge label={submission.reviewStatus} tone={reviewTone(submission.reviewStatus)} />
                <ChevronRight size={16} aria-hidden="true" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
