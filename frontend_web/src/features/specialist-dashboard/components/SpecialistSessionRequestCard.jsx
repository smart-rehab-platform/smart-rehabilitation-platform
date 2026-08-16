import { ExternalLink } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { formatSessionDurationLabel } from "../utils/specialistSessionsLocalization";

export function SpecialistSessionRequestCard({ request }) {
  const { t } = useLocale();
  const approvedSession = request.approvedSession;
  const location = approvedSession?.locationOrLink?.trim();
  const meetingUrl = approvedSession?.meetingUrl;

  return (
    <article className="pd-card pd-card-pad pd-specialist-session-request-card">
      <div className="pd-specialist-session-request-card-header">
        <div>
          <strong className="pd-specialist-session-request-patient" dir="auto">{request.patientName}</strong>
          <p className="pd-specialist-session-request-parent" dir="auto">{request.parentName}</p>
        </div>
        <StatusBadge label={request.statusMeta.label} tone={request.statusMeta.tone} />
      </div>

      <p className="pd-specialist-session-request-reason" dir="auto">{request.reasonLabel}</p>

      {request.reason === "other" && request.reasonOtherText ? (
        <p className="pd-specialist-session-request-reason-other" dir="auto">{request.reasonOtherText}</p>
      ) : null}

      <dl className="pd-specialist-session-request-meta">
        <div>
          <dt>{t("specialist.sessions.request.preferredDate")}</dt>
          <dd>{request.preferredDateLabel}</dd>
        </div>
        <div>
          <dt>{t("specialist.sessions.request.preferredTime")}</dt>
          <dd>{request.preferredTimeLabel}</dd>
        </div>
        <div>
          <dt>{t("specialist.sessions.request.requested")}</dt>
          <dd>{request.createdAtLabel}</dd>
        </div>
      </dl>

      {request.notes ? (
        <p className="pd-specialist-session-request-notes" dir="auto">{request.notes}</p>
      ) : null}

      {request.status === "rejected" && request.rejectionReason ? (
        <div className="pd-specialist-session-request-panel pd-specialist-session-request-panel--rejected" dir="auto">
          {request.rejectionReason}
        </div>
      ) : null}

      {request.status === "approved" && approvedSession ? (
        <div className="pd-specialist-session-request-panel pd-specialist-session-request-panel--approved">
          <p>{approvedSession.scheduledAtLabel}</p>
          {approvedSession.durationMinutes != null ? (
            <p>
              {t("specialist.sessions.request.duration")}
              {" "}
              {formatSessionDurationLabel(approvedSession.durationMinutes, t)}
            </p>
          ) : null}
          {location ? (
            <p dir="auto">{location}</p>
          ) : null}
          {meetingUrl ? (
            <a
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pd-specialist-session-request-link"
            >
              <ExternalLink size={14} aria-hidden="true" />
              {t("specialist.sessions.openMeetingLink")}
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
