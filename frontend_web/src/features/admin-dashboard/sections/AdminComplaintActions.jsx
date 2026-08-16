import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

export function AdminComplaintActions({
  complaint,
  onStartReview,
  onResolve,
  onReject,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);

  if (!complaint) {
    return null;
  }

  const { canStartReview, canResolve, canReject } = complaint;
  if (!canStartReview && !canResolve && !canReject) {
    return null;
  }

  return (
    <section
      className="pd-card pd-card-pad pd-admin-complaint-actions pd-section-enter"
      aria-label={labels.reviewActionsAriaLabel}
    >
      <div className="pd-admin-complaint-actions-copy">
        <h2 className="pd-admin-complaint-section-title">{labels.reviewActions}</h2>
        <p className="pd-admin-complaint-empty-copy">{labels.reviewActionsHint}</p>
      </div>

      <div className="pd-admin-complaint-actions-buttons">
        {canStartReview ? (
          <button type="button" className="pd-btn pd-btn-primary" onClick={onStartReview}>
            {labels.actions.startReview}
          </button>
        ) : null}

        {canResolve ? (
          <button type="button" className="pd-btn pd-btn-success" onClick={onResolve}>
            {labels.actions.resolve}
          </button>
        ) : null}

        {canReject ? (
          <button type="button" className="pd-btn pd-btn-danger" onClick={onReject}>
            {labels.actions.reject}
          </button>
        ) : null}
      </div>
    </section>
  );
}
