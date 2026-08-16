import { getSupportRequestStatusActions } from "../../shared-dashboard/utils/supportRequestMappers";

export function AdminSupportRequestActions({
  labels,
  request,
  isUpdatingStatus,
  statusError,
  onMarkInProgress,
  onMarkResolved,
}) {
  if (!request) {
    return null;
  }

  const actions = getSupportRequestStatusActions(request.status);
  if (!actions.canMarkInProgress && !actions.canMarkResolved) {
    return null;
  }

  return (
    <div className="pd-support-request-ticket-actions" aria-label={labels.actionsAriaLabel}>
      <div className="pd-support-request-ticket-actions-status">
        <span className="pd-support-request-ticket-actions-label">{labels.requestStatus}</span>
        <span className="pd-support-request-ticket-actions-value">{request.statusLabel}</span>
      </div>

      {statusError ? <p className="pd-inline-error" role="alert">{statusError}</p> : null}

      <div className="pd-support-request-status-actions">
        {actions.canMarkInProgress ? (
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            disabled={isUpdatingStatus}
            onClick={onMarkInProgress}
          >
            {labels.markInProgress}
          </button>
        ) : null}
        {actions.canMarkResolved ? (
          <button
            type="button"
            className="pd-btn pd-btn-success"
            disabled={isUpdatingStatus}
            onClick={onMarkResolved}
          >
            {labels.resolveRequest}
          </button>
        ) : null}
      </div>
    </div>
  );
}
