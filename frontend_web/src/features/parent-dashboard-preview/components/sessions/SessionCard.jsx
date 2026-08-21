import { useLocale } from "../../../../context/useLocale.js";
import { StatusBadge } from "../StatusBadge";
import {
  copyMeetingUrl,
  getMeetingLinkCopyError,
  getMeetingLinkUnavailableError,
  openMeetingUrl,
} from "../../utils/parentSessionsUtils";

function SessionMetric({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="pd-session-card-metric">
      <span className="pd-session-card-metric-label">{label}</span>
      <span className="pd-session-card-metric-value">{value}</span>
    </div>
  );
}

export function SessionCard({ session, onCopySuccess, onCopyError, onOpenError }) {
  const { t } = useLocale();
  const statusMeta = session.statusMeta;

  const handleOpenMeeting = () => {
    try {
      openMeetingUrl(session.meetingUrl);
    } catch (error) {
      onOpenError?.(error instanceof Error ? error.message : getMeetingLinkUnavailableError(t));
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyMeetingUrl(session.meetingUrl);
      onCopySuccess?.(t("parent.sessions.errors.meetingLinkCopied"));
    } catch (error) {
      onCopyError?.(error instanceof Error ? error.message : getMeetingLinkCopyError(t));
    }
  };

  const locationValue = !session.meetingUrl && session.physicalLocation
    ? session.physicalLocation
    : null;

  return (
    <article className="pd-card pd-card-pad pd-session-hub-card pd-section-enter">
      <div className="pd-session-card-top">
        {session.sessionDate ? (
          <h3 className="pd-session-card-date">{session.sessionDate}</h3>
        ) : <span aria-hidden="true" />}
        {statusMeta ? (
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        ) : null}
      </div>

      {session.childName ? (
        <p className="pd-session-card-child">
          {t("parent.reports.forChild", { name: session.childName })}
        </p>
      ) : null}

      {(session.startTime || session.endTime || session.durationMinutes != null) ? (
        <div className="pd-session-card-metrics">
          <SessionMetric label={t("parent.sessions.startTime")} value={session.startTime} />
          <SessionMetric label={t("parent.sessions.endTime")} value={session.endTime} />
          {session.durationMinutes != null ? (
            <SessionMetric
              label={t("parent.sessions.duration")}
              value={t("parent.common.durationMinutes", { count: session.durationMinutes })}
            />
          ) : null}
        </div>
      ) : null}

      {(session.specialistName || locationValue) ? (
        <div className="pd-session-card-metrics pd-session-card-metrics-secondary">
          <SessionMetric label={t("parent.common.specialist")} value={session.specialistName} />
          {locationValue ? (
            <SessionMetric
              label={t("parent.sessions.location")}
              value={locationValue}
            />
          ) : null}
        </div>
      ) : null}

      {session.meetingUrl ? (
        <div className="pd-session-hub-link-actions">
          <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={handleOpenMeeting}>
            {t("parent.sessions.openMeeting")}
          </button>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={handleCopyLink}>
            {t("parent.sessions.copyLink")}
          </button>
        </div>
      ) : null}
    </article>
  );
}
