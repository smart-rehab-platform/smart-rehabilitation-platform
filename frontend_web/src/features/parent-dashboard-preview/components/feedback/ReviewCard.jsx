import { exerciseStatusMeta } from "../../mock/parentDashboardMock";
import { StatusBadge } from "../StatusBadge";

export function ReviewCard({ review }) {
  const statusMeta = exerciseStatusMeta[review.status] || exerciseStatusMeta.reviewed;

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-feedback-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          {review.exerciseTitle ? (
            <h3 className="pd-task-hub-card-title">{review.exerciseTitle}</h3>
          ) : null}
          {review.childName ? (
            <p className="pd-task-hub-card-child">For {review.childName}</p>
          ) : null}
        </div>
        <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
      </div>

      {review.requiresRetry ? (
        <p className="pd-feedback-retry-badge" role="status">
          Requires Retry
        </p>
      ) : null}

      {(review.reviewedAt || review.specialistName || review.performanceRating != null) ? (
        <ul className="pd-task-hub-card-meta">
          {review.reviewedAt ? (
            <li>
              <strong>Review date</strong>
              <span>{review.reviewedAt}</span>
            </li>
          ) : null}
          {review.specialistName ? (
            <li>
              <strong>Specialist</strong>
              <span>{review.specialistName}</span>
            </li>
          ) : null}
          {review.performanceRating != null ? (
            <li>
              <strong>Performance rating</strong>
              <span>{review.performanceRating}/10</span>
            </li>
          ) : null}
        </ul>
      ) : null}

      {review.feedback ? (
        <blockquote className="pd-feedback-quote">&ldquo;{review.feedback}&rdquo;</blockquote>
      ) : null}
    </article>
  );
}
