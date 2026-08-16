import { useLocale } from "../../../../context/useLocale.js";
import { SupportRequestStatusBadge } from "./SupportRequestStatusBadge";

export function SupportRequestSummary({ request }) {
  const { t } = useLocale();

  if (!request) {
    return null;
  }

  const unavailable = t("common.dateUnavailable");
  const showRequester = Boolean(request.specialistName || request.specialistEmail);
  const showResolvedDate = request.resolvedAtLabel && request.resolvedAtLabel !== unavailable;

  return (
    <header className="pd-support-request-ticket-header">
      <div className="pd-support-request-ticket-title-row">
        <div className="pd-support-request-ticket-title-group">
          <h1 className="pd-support-request-ticket-title" dir="auto">{request.subject}</h1>
          <div className="pd-support-request-ticket-category-row">
            <p className="pd-support-request-ticket-category">{request.categoryLabel}</p>
            <SupportRequestStatusBadge
              status={request.status}
              label={request.statusLabel}
              tone={request.statusTone}
            />
          </div>
        </div>
      </div>

      {showRequester ? (
        <div className="pd-support-request-ticket-requester">
          {request.specialistName ? (
            <span className="pd-support-request-ticket-requester-name" dir="auto">{request.specialistName}</span>
          ) : null}
          {request.specialistEmail ? (
            <span className="pd-support-request-ticket-requester-email" dir="ltr">{request.specialistEmail}</span>
          ) : null}
        </div>
      ) : null}

      <div className="pd-support-request-ticket-meta">
        <span>{t("supportRequests.created")} {request.createdAtLabel}</span>
        <span className="pd-support-request-ticket-meta-sep" aria-hidden="true">•</span>
        <span>{t("supportRequests.lastActivity")} {request.lastMessageAtLabel}</span>
        {showResolvedDate ? (
          <>
            <span className="pd-support-request-ticket-meta-sep" aria-hidden="true">•</span>
            <span>{t("supportRequests.resolvedDate")} {request.resolvedAtLabel}</span>
          </>
        ) : null}
      </div>
    </header>
  );
}
