import { MapPin, Video } from "lucide-react";

function SessionRow({ session, onViewDetails, onOpenMeeting, showDivider }) {
  const hasMeetingLink = Boolean(session.meetingUrl);
  const isOnline = session.mode?.toLowerCase() === "online";
  const specialistShort = session.specialistName?.replace(/^(\S+\s+\S+).*/, "$1")
    || session.specialistName;

  return (
    <article className={`pd-schedule-item${showDivider ? " has-divider" : ""}`}>
      <div className="pd-schedule-item-when">
        <strong>{session.dateLabel || session.whenLabel}</strong>
        {session.timeLabel ? <span>{session.timeLabel}</span> : null}
      </div>

      <p className="pd-schedule-item-specialist">{specialistShort}</p>

      <div className="pd-schedule-item-meta">
        {isOnline ? (
          <span className="pd-schedule-mode">
            <Video size={12} aria-hidden="true" />
            Online meeting
          </span>
        ) : session.location ? (
          <span className="pd-schedule-mode">
            <MapPin size={12} aria-hidden="true" />
            {session.location}
          </span>
        ) : (
          <span className="pd-schedule-mode">In-person session</span>
        )}
      </div>

      <div className="pd-schedule-item-actions">
        {hasMeetingLink && isOnline ? (
          <button
            type="button"
            className="pd-btn pd-btn-primary pd-btn-sm"
            onClick={() => onOpenMeeting?.(session)}
          >
            Open Meeting
          </button>
        ) : null}
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-btn-sm"
          aria-label="View session details"
          data-testid="pd-upcoming-session-view-details"
          onClick={() => onViewDetails?.(session)}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export function UpcomingSessionCard({
  sessions = [],
  onViewDetails,
  onOpenMeeting,
}) {
  const items = Array.isArray(sessions) ? sessions.filter(Boolean) : [];

  return (
    <section className="pd-session-minimal pd-schedule-card pd-section-enter" aria-label="Upcoming schedule">
      <h2 className="pd-overview-title">Upcoming Schedule</h2>

      {items.length === 0 ? (
        <p className="pd-schedule-empty">No upcoming sessions scheduled.</p>
      ) : (
        <div className="pd-schedule-list">
          {items.map((session, index) => (
            <SessionRow
              key={session.id || `${session.whenLabel}-${index}`}
              session={session}
              onViewDetails={onViewDetails}
              onOpenMeeting={onOpenMeeting}
              showDivider={index > 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
