import { getComplaintStatusActions } from "../utils/adminComplaintsMappers";

export function AdminComplaintActions({
  complaint,
  onStartReview,
  onResolve,
  onReject,
}) {
  if (!complaint) {
    return null;
  }

  const actions = getComplaintStatusActions(complaint.status);
  if (!actions.canStartReview && !actions.canResolve && !actions.canReject) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-actions pd-section-enter" aria-label="Complaint actions">
      <div className="pd-admin-complaint-actions-copy">
        <h2 className="pd-admin-complaint-section-title">Review Actions</h2>
        <p className="pd-admin-complaint-empty-copy">
          Update this complaint status according to your review outcome.
        </p>
      </div>

      <div className="pd-admin-complaint-actions-buttons">
        {actions.canStartReview ? (
          <button type="button" className="pd-btn pd-btn-primary" onClick={onStartReview}>
            Start Review
          </button>
        ) : null}

        {actions.canResolve ? (
          <button type="button" className="pd-btn pd-btn-success" onClick={onResolve}>
            Resolve Complaint
          </button>
        ) : null}

        {actions.canReject ? (
          <button type="button" className="pd-btn pd-btn-danger" onClick={onReject}>
            Reject Complaint
          </button>
        ) : null}
      </div>
    </section>
  );
}
