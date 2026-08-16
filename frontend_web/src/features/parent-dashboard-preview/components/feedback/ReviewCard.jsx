import { useLocale } from "../../../../context/useLocale.js";
import { StatusBadge } from "../StatusBadge";
import { getFeedbackStatusMeta } from "../../utils/parentFeedbackUtils";

export function ReviewCard({ review }) {
  const { t } = useLocale();
  const statusMeta = getFeedbackStatusMeta(review.status, t);

  return (
    <article className="pd-card pd-card-pad pd-feedback-card pd-section-enter">
      <div className="pd-feedback-card-head">
        <div className="pd-feedback-card-copy">
          <h3 className="pd-feedback-card-title" dir="auto">{review.exerciseTitle}</h3>
          {review.childName ? (
            <p className="pd-feedback-card-child">{review.childName}</p>
          ) : null}
        </div>
        <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
      </div>

      {review.reviewedAtLabel ? (
        <p className="pd-feedback-card-date">{review.reviewedAtLabel}</p>
      ) : null}

      {review.rating != null ? (
        <p className="pd-feedback-card-rating">
          {t("parent.feedback.rating")}: {review.rating}/5
        </p>
      ) : null}

      {review.feedbackText ? (
        <blockquote className="pd-feedback-card-quote" dir="auto">
          {review.feedbackText}
        </blockquote>
      ) : null}
    </article>
  );
}
