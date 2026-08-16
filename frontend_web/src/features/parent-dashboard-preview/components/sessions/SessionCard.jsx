import { useLocale } from "../../../../context/useLocale.js";
import { StatusBadge } from "../StatusBadge";
import {
  copyMeetingUrl,
  getMeetingLinkCopyError,
  getMeetingLinkUnavailableError,
  openMeetingUrl,
} from "../../utils/parentSessionsUtils";

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

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-session-hub-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          {session.sessionDate ? (
            <h3 className="pd-task-hub-card-title">{session.sessionDate}</h3>
          ) : null}
          {session.childName ? (
            <p className="pd-task-hub-card-child">
              {t("parent.reports.forChild", { name: session.childName })}
            </p>
          ) : null}
        </div>
        {statusMeta ? (
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        ) : null}
      </div>

      <ul className="pd-task-hub-card-meta">
        {session.startTime ? (
          <li>
            <strong>{t("parent.sessions.startTime")}</strong>
            <span>{session.startTime}</span>
          </li>
        ) : null}
        {session.endTime ? (
          <li>
            <strong>{t("parent.sessions.endTime")}</strong>
            <span>{session.endTime}</span>
          </li>
        ) : null}
        {session.durationMinutes != null ? (
          <li>
            <strong>{t("parent.sessions.duration")}</strong>
            <span>{t("parent.common.durationMinutes", { count: session.durationMinutes })}</span>
          </li>
        ) : null}
        {session.specialistName ? (
          <li>
            <strong>{t("parent.common.specialist")}</strong>
            <span>{session.specialistName}</span>
          </li>
        ) : null}
        {!session.meetingUrl && session.physicalLocation ? (
          <li className="pd-session-location-row">
            <strong>{t("parent.sessions.location")}</strong>
            <span className="pd-session-location-text" dir="auto">{session.physicalLocation}</span>
          </li>
        ) : null}
      </ul>

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
