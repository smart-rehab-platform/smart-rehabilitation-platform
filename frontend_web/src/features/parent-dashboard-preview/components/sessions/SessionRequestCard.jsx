import { useLocale } from "../../../../context/useLocale.js";
import { StatusBadge } from "../StatusBadge";

export function SessionRequestCard({ request }) {
  const { t } = useLocale();
  const statusMeta = request.statusMeta;

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-session-request-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          {request.reasonLabel ? (
            <h3 className="pd-task-hub-card-title">{request.reasonLabel}</h3>
          ) : null}
          {request.childName ? (
            <p className="pd-task-hub-card-child">
              {t("parent.reports.forChild", { name: request.childName })}
            </p>
          ) : null}
        </div>
        {statusMeta ? (
          <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
        ) : null}
      </div>

      <ul className="pd-task-hub-card-meta">
        {request.createdAt ? (
          <li>
            <strong>{t("parent.sessions.requested")}</strong>
            <span>{request.createdAt}</span>
          </li>
        ) : null}
        {request.preferredDate ? (
          <li>
            <strong>{t("parent.common.preferredDate")}</strong>
            <span>{request.preferredDate}</span>
          </li>
        ) : null}
        {request.preferredTimePeriodLabel ? (
          <li>
            <strong>{t("parent.sessions.preferredTime")}</strong>
            <span>{request.preferredTimePeriodLabel}</span>
          </li>
        ) : null}
        {request.specialistName ? (
          <li>
            <strong>{t("parent.common.specialist")}</strong>
            <span>{request.specialistName}</span>
          </li>
        ) : null}
      </ul>

      {request.reasonOtherText ? (
        <p className="pd-session-request-note" dir="auto">
          <strong>{t("parent.common.reasonDetails")}:</strong> {request.reasonOtherText}
        </p>
      ) : null}

      {request.notes ? (
        <p className="pd-session-request-note" dir="auto">
          <strong>{t("parent.common.notes")}:</strong> {request.notes}
        </p>
      ) : null}

      {request.rejectionReason ? (
        <p
          className={`pd-session-request-note${
            request.status === "rejected" ? " pd-session-request-rejection" : ""
          }`}
          dir="auto"
        >
          <strong>{t("parent.sessions.response")}:</strong> {request.rejectionReason}
        </p>
      ) : null}

      {request.approvedSession ? (
        <div className="pd-session-request-approved">
          <strong>{t("parent.sessions.approvedSession")}</strong>
          <ul className="pd-task-hub-card-meta">
            {request.approvedSession.sessionDate ? (
              <li>
                <strong>{t("parent.sessions.date")}</strong>
                <span>{request.approvedSession.sessionDate}</span>
              </li>
            ) : null}
            {request.approvedSession.startTime ? (
              <li>
                <strong>{t("parent.sessions.time")}</strong>
                <span>{request.approvedSession.startTime}</span>
              </li>
            ) : null}
            {request.approvedSession.physicalLocation ? (
              <li>
                <strong>{t("parent.sessions.location")}</strong>
                <span dir="auto">{request.approvedSession.physicalLocation}</span>
              </li>
            ) : null}
            {request.approvedSession.meetingUrl ? (
              <li>
                <strong>{t("parent.sessions.meetingLink")}</strong>
                <span className="pd-session-location-text">{request.approvedSession.meetingUrl}</span>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
