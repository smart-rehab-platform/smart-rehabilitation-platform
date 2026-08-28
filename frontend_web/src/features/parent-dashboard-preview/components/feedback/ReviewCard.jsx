import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { StatusBadge } from "../StatusBadge";
import { getFeedbackStatusMeta, formatParentPerformanceRating } from "../../utils/parentFeedbackUtils";

export function ReviewCard({ review, onOpen }) {
  const { t } = useLocale();
  const statusMeta = getFeedbackStatusMeta(review.status, t);
  const isInteractive = typeof onOpen === "function";
  const openLabel = t("parent.feedback.openReview", {
    title: review.exerciseTitle || t("parent.feedback.title"),
  });
  const ratingDisplay = formatParentPerformanceRating(review.performanceRating);

  const handleActivate = () => {
    onOpen?.(review);
  };

  const handleKeyDown = (event) => {
    if (!isInteractive) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  };

  return (
    <article
      className={
        isInteractive
          ? "pd-card pd-card-pad pd-feedback-card pd-feedback-card--interactive pd-section-enter"
          : "pd-card pd-card-pad pd-feedback-card pd-section-enter"
      }
      role={isInteractive ? "link" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? openLabel : undefined}
      onClick={isInteractive ? handleActivate : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
    >
      <div className="pd-feedback-card-head">
        <div className="pd-feedback-card-copy">
          <h3 className="pd-feedback-card-title" dir="auto">{review.exerciseTitle}</h3>
          {review.childName ? (
            <p className="pd-feedback-card-child">{review.childName}</p>
          ) : null}
        </div>
        <div className="pd-feedback-card-aside">
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
          {isInteractive ? (
            <ChevronRight size={16} className="pd-feedback-card-chevron" aria-hidden="true" />
          ) : null}
        </div>
      </div>

      {review.reviewedAt ? (
        <p className="pd-feedback-card-date">{review.reviewedAt}</p>
      ) : null}

      {ratingDisplay != null ? (
        <p className="pd-feedback-card-rating">
          {t("parent.feedback.rating")}: {ratingDisplay}/5
        </p>
      ) : null}

      {review.feedback ? (
        <blockquote className="pd-feedback-card-quote" dir="auto">
          {review.feedback}
        </blockquote>
      ) : null}
    </article>
  );
}
