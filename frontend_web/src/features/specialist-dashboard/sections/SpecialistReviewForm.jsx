import { AudioLines } from "lucide-react";
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
  return (
    <section className="pd-card pd-card-pad pd-specialist-review-form">
      <h3 className="pd-specialist-review-section-title">Review</h3>

      <div className="pd-specialist-review-field">
        <span className="pd-specialist-review-field-label">Rating</span>
        <SpecialistStarRating rating={starRating} onChange={onStarRatingChange} />
      </div>

      <div className="pd-specialist-review-field">
        <label className="pd-specialist-review-field-label" htmlFor="specialist-review-feedback">
          Feedback
        </label>
        <textarea
          id="specialist-review-feedback"
          className="pd-textarea pd-specialist-review-feedback"
          rows={5}
          value={feedback}
          onChange={(event) => onFeedbackChange(event.target.value)}
          placeholder="Write feedback for the parent and patient..."
          disabled={isSubmitting}
        />
      </div>

      <div className="pd-specialist-review-field">
        <span className="pd-specialist-review-field-label">Status</span>
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
            View Speech Analysis
          </button>
        ) : null}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-specialist-review-submit"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isUpdate ? "Update Review" : "Submit Review"}
        </button>
      </div>
    </section>
  );
}
