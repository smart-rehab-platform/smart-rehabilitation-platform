import { StatusBadge } from "../StatusBadge";

export function SessionRequestCard({ request }) {
  const statusMeta = request.statusMeta;

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-session-request-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          {request.reasonLabel ? (
            <h3 className="pd-task-hub-card-title">{request.reasonLabel}</h3>
          ) : null}
          {request.childName ? (
            <p className="pd-task-hub-card-child">For {request.childName}</p>
          ) : null}
        </div>
        {statusMeta ? (
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        ) : null}
      </div>

      <ul className="pd-task-hub-card-meta">
        {request.createdAt ? (
          <li>
            <strong>Requested</strong>
            <span>{request.createdAt}</span>
          </li>
        ) : null}
        {request.preferredDate ? (
          <li>
            <strong>Preferred date</strong>
            <span>{request.preferredDate}</span>
          </li>
        ) : null}
        {request.preferredTimePeriodLabel ? (
          <li>
            <strong>Preferred time</strong>
            <span>{request.preferredTimePeriodLabel}</span>
          </li>
        ) : null}
        {request.specialistName ? (
          <li>
            <strong>Specialist</strong>
            <span>{request.specialistName}</span>
          </li>
        ) : null}
      </ul>

      {request.reasonOtherText ? (
        <p className="pd-session-request-note">
          <strong>Reason details:</strong> {request.reasonOtherText}
        </p>
      ) : null}

      {request.notes ? (
        <p className="pd-session-request-note">
          <strong>Notes:</strong> {request.notes}
        </p>
      ) : null}

      {request.rejectionReason ? (
        <p className="pd-session-request-note pd-session-request-rejection">
          <strong>Response:</strong> {request.rejectionReason}
        </p>
      ) : null}

      {request.approvedSession ? (
        <div className="pd-session-request-approved">
          <strong>Approved session</strong>
          <ul className="pd-task-hub-card-meta">
            {request.approvedSession.sessionDate ? (
              <li>
                <strong>Date</strong>
                <span>{request.approvedSession.sessionDate}</span>
              </li>
            ) : null}
            {request.approvedSession.startTime ? (
              <li>
                <strong>Time</strong>
                <span>{request.approvedSession.startTime}</span>
              </li>
            ) : null}
            {request.approvedSession.physicalLocation ? (
              <li>
                <strong>Location</strong>
                <span>{request.approvedSession.physicalLocation}</span>
              </li>
            ) : null}
            {request.approvedSession.meetingUrl ? (
              <li>
                <strong>Meeting link</strong>
                <span className="pd-session-location-text">{request.approvedSession.meetingUrl}</span>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
