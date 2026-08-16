import { MapPin, Video } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";

function SessionRow({ session, onViewDetails, onOpenMeeting, showDivider, t }) {
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
            {t("parent.home.onlineMeeting")}
          </span>
        ) : session.location ? (
          <span className="pd-schedule-mode">
            <MapPin size={12} aria-hidden="true" />
            {session.location}
          </span>
        ) : (
          <span className="pd-schedule-mode">{t("parent.home.inPersonSession")}</span>
        )}
      </div>

      <div className="pd-schedule-item-actions">
        {hasMeetingLink && isOnline ? (
          <button
            type="button"
            className="pd-btn pd-btn-primary pd-btn-sm"
            onClick={() => onOpenMeeting?.(session)}
          >
            {t("parent.home.openMeeting")}
          </button>
        ) : null}
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-btn-sm"
          aria-label={t("parent.home.viewSessionDetails")}
          data-testid="pd-upcoming-session-view-details"
          onClick={() => onViewDetails?.(session)}
        >
          {t("parent.home.viewDetails")}
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
  const { t } = useLocale();
  const items = Array.isArray(sessions) ? sessions.filter(Boolean) : [];

  return (
    <section className="pd-session-minimal pd-schedule-card pd-section-enter" aria-label={t("parent.home.upcomingSchedule")}>
      <h2 className="pd-overview-title">{t("parent.home.upcomingSchedule")}</h2>

      {items.length === 0 ? (
        <p className="pd-schedule-empty">{t("parent.home.noUpcomingSessions")}</p>
      ) : (
        <div className="pd-schedule-list">
          {items.map((session, index) => (
            <SessionRow
              key={session.id || `${session.whenLabel}-${index}`}
              session={session}
              onViewDetails={onViewDetails}
              onOpenMeeting={onOpenMeeting}
              showDivider={index > 0}
              t={t}
            />
          ))}
        </div>
      )}
    </section>
  );
}
