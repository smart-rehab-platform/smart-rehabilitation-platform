import { ExternalLink } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function SpecialistSessionRequestCard({ request }) {
  const approvedSession = request.approvedSession;
  const location = approvedSession?.locationOrLink?.trim();
  const meetingUrl = approvedSession?.meetingUrl;

  return (
    <article className="pd-card pd-card-pad pd-specialist-session-request-card">
      <div className="pd-specialist-session-request-card-header">
        <div>
          <strong className="pd-specialist-session-request-patient">{request.patientName}</strong>
          <p className="pd-specialist-session-request-parent">{request.parentName}</p>
        </div>
        <StatusBadge label={request.statusMeta.label} tone={request.statusMeta.tone} />
      </div>

      <p className="pd-specialist-session-request-reason">{request.reasonLabel}</p>

      {request.reason === "other" && request.reasonOtherText ? (
        <p className="pd-specialist-session-request-reason-other">{request.reasonOtherText}</p>
      ) : null}

      <dl className="pd-specialist-session-request-meta">
        <div>
          <dt>Preferred date</dt>
          <dd>{request.preferredDateLabel}</dd>
        </div>
        <div>
          <dt>Preferred time</dt>
          <dd>{request.preferredTimeLabel}</dd>
        </div>
        <div>
          <dt>Requested</dt>
          <dd>{request.createdAtLabel}</dd>
        </div>
      </dl>

      {request.notes ? (
        <p className="pd-specialist-session-request-notes">{request.notes}</p>
      ) : null}

      {request.status === "rejected" && request.rejectionReason ? (
        <div className="pd-specialist-session-request-panel pd-specialist-session-request-panel--rejected">
          {request.rejectionReason}
        </div>
      ) : null}

      {request.status === "approved" && approvedSession ? (
        <div className="pd-specialist-session-request-panel pd-specialist-session-request-panel--approved">
          <p>
            <strong>Scheduled:</strong>
            {" "}
            {approvedSession.scheduledAtLabel}
          </p>
          {approvedSession.durationMinutes != null ? (
            <p>
              <strong>Duration:</strong>
              {" "}
              {approvedSession.durationMinutes}
              {" "}
              min
            </p>
          ) : null}
          {location ? (
            <p>{location}</p>
          ) : null}
          {meetingUrl ? (
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pd-specialist-session-request-link"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Open meeting link
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
