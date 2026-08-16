import { AudioLines } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { SpecialistReviewDecision } from "../components/SpecialistReviewDecision";
import { SpecialistStarRating } from "../components/SpecialistStarRating";

export function SpecialistReviewForm({
  starRating,
  onStarRatingChange,
  feedback,
  onFeedbackChange,
  requiresRetry,
  onRequiresRetryChange,
  isSubmitting,
  submitError,
  isUpdate,
  onSubmit,
  showSpeechAnalysis = false,
  onSpeechAnalysis,
}) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-specialist-review-form">
      <h3 className="pd-specialist-review-section-title">{t("specialist.reviews.form.section")}</h3>

      <div className="pd-specialist-review-field">
        <span className="pd-specialist-review-field-label">{t("specialist.reviews.form.rating")}</span>
        <SpecialistStarRating rating={starRating} onChange={onStarRatingChange} />
      </div>

      <div className="pd-specialist-review-field">
        <label className="pd-specialist-review-field-label" htmlFor="specialist-review-feedback">
          {t("specialist.reviews.form.feedback")}
        </label>
        <textarea
          id="specialist-review-feedback"
          className="pd-textarea pd-specialist-review-feedback"
          rows={5}
          value={feedback}
          onChange={(event) => onFeedbackChange(event.target.value)}
          placeholder={t("specialist.reviews.form.feedbackPlaceholder")}
          disabled={isSubmitting}
          dir="auto"
        />
      </div>

      <div className="pd-specialist-review-field">
        <span className="pd-specialist-review-field-label">{t("specialist.reviews.form.status")}</span>
        <SpecialistReviewDecision
          requiresRetry={requiresRetry}
          onChange={onRequiresRetryChange}
        />
      </div>

      {submitError ? <p className="pd-inline-error">{submitError}</p> : null}

      <div className="pd-specialist-review-actions">
        {showSpeechAnalysis ? (
          <button
            type="button"
            className="pd-btn pd-btn-soft pd-specialist-review-speech-btn"
            onClick={onSpeechAnalysis}
            disabled={isSubmitting}
          >
            <AudioLines size={16} aria-hidden="true" />
            {t("specialist.reviews.form.speechAnalysis")}
          </button>
        ) : null}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-specialist-review-submit"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("specialist.reviews.form.submitting")
            : isUpdate
              ? t("specialist.reviews.form.update")
              : t("specialist.reviews.form.submit")}
        </button>
      </div>
    </section>
  );
}
