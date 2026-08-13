export function SpecialistReviewDecision({ requiresRetry, onChange }) {
  return (
    <div className="pd-specialist-review-decision" role="group" aria-label="Review decision">
      <button
        type="button"
        className={`pd-specialist-review-decision-btn${!requiresRetry ? " is-selected" : ""}`}
        onClick={() => onChange(false)}
        aria-pressed={!requiresRetry}
      >
        Approved
      </button>
      <button
        type="button"
        className={`pd-specialist-review-decision-btn${requiresRetry ? " is-selected" : ""}`}
        onClick={() => onChange(true)}
        aria-pressed={requiresRetry}
      >
        Needs Retry
      </button>
    </div>
  );
}
