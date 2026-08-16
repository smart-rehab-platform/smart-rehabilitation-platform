import { useLocale } from "../../../context/useLocale";
import { getReviewDecisionLabel } from "../utils/specialistReviewsLocalization";

export function SpecialistReviewDecision({ requiresRetry, onChange }) {
  const { t } = useLocale();

  return (
    <div
      className="pd-specialist-review-decision"
      role="group"
      aria-label={t("specialist.reviews.form.decisionAriaLabel")}
    >
      <button
        type="button"
        className={`pd-specialist-review-decision-btn${!requiresRetry ? " is-selected" : ""}`}
        onClick={() => onChange(false)}
        aria-pressed={!requiresRetry}
      >
        {getReviewDecisionLabel(false, t)}
      </button>
      <button
        type="button"
        className={`pd-specialist-review-decision-btn${requiresRetry ? " is-selected" : ""}`}
        onClick={() => onChange(true)}
        aria-pressed={requiresRetry}
      >
        {getReviewDecisionLabel(true, t)}
      </button>
    </div>
  );
}
