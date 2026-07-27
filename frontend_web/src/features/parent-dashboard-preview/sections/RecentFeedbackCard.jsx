export function RecentFeedbackCard({ feedback, specialistInitials, onViewFull }) {
  return (
    <section className="pd-card pd-card-pad pd-equal-card">
      <h2 className="pd-section-title">Recent Feedback</h2>

      <div className="pd-feedback-head">
        <span className="pd-avatar pd-avatar-sm" aria-hidden="true">
          {specialistInitials}
        </span>
        <div>
          <strong>{feedback.specialistName}</strong>
          <span>
            {feedback.specialty} · {feedback.date}
          </span>
        </div>
      </div>

      <blockquote className="pd-quote">&ldquo;{feedback.quote}&rdquo;</blockquote>

      <div className="pd-card-footer pd-card-footer-end">
        <button type="button" className="pd-link" onClick={onViewFull}>
          View Full Feedback →
        </button>
      </div>
    </section>
  );
}
