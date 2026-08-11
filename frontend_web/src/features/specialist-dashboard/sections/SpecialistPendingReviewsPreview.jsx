import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

function PreviewCardHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="pd-card-header">
      <div>
        <h2 className="pd-section-title">{title}</h2>
        <p className="pd-section-sub">{subtitle}</p>
      </div>
      <button type="button" className="pd-link" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export function SpecialistPendingReviewsPreview({
  reviews = [],
  isLoading = false,
  error = null,
  onRetry,
  onViewAll,
  onReviewClick,
}) {
  return (
    <section
      className="pd-card pd-card-pad pd-specialist-preview-card"
      aria-label="Pending reviews"
    >
      <PreviewCardHeader
        title="Pending Reviews"
        subtitle="Submissions waiting for your feedback"
        actionLabel="View All"
        onAction={onViewAll}
      />

      {isLoading ? (
        <p className="pd-inline-loading pd-specialist-preview-loading">Loading pending reviews...</p>
      ) : error ? (
        <div className="pd-specialist-preview-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <p className="pd-specialist-preview-empty">No pending reviews right now.</p>
      ) : (
        <ul className="pd-specialist-preview-list">
          {reviews.map((review) => (
            <li key={review.id}>
              <button
                type="button"
                className="pd-specialist-preview-row"
                onClick={() => onReviewClick?.(review)}
              >
                <UserProfileAvatar
                  imageUrl={null}
                  initials={getInitials(review.patientName, "P")}
                  alt=""
                  shellClassName="pd-avatar pd-specialist-preview-avatar"
                  fallbackClassName="pd-avatar pd-specialist-preview-avatar"
                  className="pd-avatar-photo"
                />
                <span className="pd-specialist-preview-copy">
                  <strong>{review.patientName}</strong>
                  <span>
                    {review.exerciseTitle}
                    {" • "}
                    {review.submittedAgo}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
