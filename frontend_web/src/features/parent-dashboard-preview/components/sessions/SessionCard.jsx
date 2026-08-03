import { StatusBadge } from "../StatusBadge";
import { copyMeetingUrl, openMeetingUrl } from "../../utils/parentSessionsUtils";

export function SessionCard({ session, onCopySuccess, onCopyError, onOpenError }) {
  const statusMeta = session.statusMeta;

  const handleOpenMeeting = () => {
    try {
      openMeetingUrl(session.meetingUrl);
    } catch (error) {
      onOpenError?.(error instanceof Error ? error.message : "Unable to open meeting link.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyMeetingUrl(session.meetingUrl);
      onCopySuccess?.("Meeting link copied.");
    } catch (error) {
      onCopyError?.(error instanceof Error ? error.message : "Unable to copy meeting link.");
    }
  };

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-session-hub-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          {session.sessionDate ? (
            <h3 className="pd-task-hub-card-title">{session.sessionDate}</h3>
          ) : null}
          {session.childName ? (
            <p className="pd-task-hub-card-child">For {session.childName}</p>
          ) : null}
        </div>
        {statusMeta ? (
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        ) : null}
      </div>

      <ul className="pd-task-hub-card-meta">
        {session.startTime ? (
          <li>
            <strong>Start time</strong>
            <span>{session.startTime}</span>
          </li>
        ) : null}
        {session.endTime ? (
          <li>
            <strong>End time</strong>
            <span>{session.endTime}</span>
          </li>
        ) : null}
        {session.durationMinutes != null ? (
          <li>
            <strong>Duration</strong>
            <span>{session.durationMinutes} min</span>
          </li>
        ) : null}
        {session.specialistName ? (
          <li>
            <strong>Specialist</strong>
            <span>{session.specialistName}</span>
          </li>
        ) : null}
        {!session.meetingUrl && session.physicalLocation ? (
          <li className="pd-session-location-row">
            <strong>Location</strong>
            <span className="pd-session-location-text">{session.physicalLocation}</span>
          </li>
        ) : null}
      </ul>

      {session.meetingUrl ? (
        <div className="pd-session-hub-link-actions">
          <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={handleOpenMeeting}>
            Open Meeting
          </button>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={handleCopyLink}>
            Copy Link
          </button>
        </div>
      ) : null}
    </article>
  );
}
