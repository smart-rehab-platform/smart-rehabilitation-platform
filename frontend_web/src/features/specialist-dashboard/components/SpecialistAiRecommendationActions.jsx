export function SpecialistAiRecommendationActions({
  isUpdating,
  onAccept,
  onReject,
}) {
  return (
    <div className="pd-specialist-ai-recommendation-actions">
      <button
        type="button"
        className="pd-btn pd-btn-primary"
        onClick={onAccept}
        disabled={isUpdating}
      >
        {isUpdating ? "Saving..." : "Accept"}
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-outline pd-specialist-ai-reject-btn"
        onClick={onReject}
        disabled={isUpdating}
      >
        Reject
      </button>
    </div>
  );
}
