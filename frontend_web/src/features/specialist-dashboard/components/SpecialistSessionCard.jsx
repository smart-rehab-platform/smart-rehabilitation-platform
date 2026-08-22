import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { canManageSpecialistSession } from "../utils/specialistSessionMappers";
import { notifySpecialistSessionRefresh } from "../utils/specialistSessionRefresh";
import { getInitials } from "../utils/specialistScheduleUtils";
import { SpecialistSessionCancelDialog } from "./SpecialistSessionCancelDialog";
import { SpecialistSessionEditDialog } from "./SpecialistSessionEditDialog";

export function SpecialistSessionCard({ session }) {
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLocale();

  const canManage = canManageSpecialistSession(session, user);
  const editLabel = t("specialist.sessions.editSession");
  const cancelLabel = t("specialist.sessions.cancelSession");

  return (
    <article className="pd-card pd-card-pad pd-specialist-session-card">
      <div className="pd-specialist-session-card-main">
        <UserProfileAvatar
          imageUrl={session.patientProfileImageUrl}
          initials={getInitials(session.patientName, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-session-card-avatar"
          fallbackClassName="pd-avatar pd-specialist-session-card-avatar"
          className="pd-avatar-photo"
        />
        <div className="pd-specialist-session-card-copy">
          <div className="pd-specialist-session-card-heading">
            <strong className="pd-specialist-session-card-patient" dir="auto">
              {session.patientName}
            </strong>
            <StatusBadge label={session.displayStatus.label} tone={session.displayStatus.tone} />
          </div>
          <p className="pd-specialist-session-card-type" dir="auto">{session.sessionType}</p>
          <div className="pd-specialist-session-card-meta">
            <span>{session.dateLabel}</span>
            <span>{session.timeLabel}</span>
            {session.locationOrLink ? (
              <span className="pd-specialist-session-card-location">
                {session.meetingUrl ? (
                  <>
                    <ExternalLink size={14} aria-hidden="true" />
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {t("specialist.sessions.meetingLink")}
                    </a>
                  </>
                ) : (
                  <>
                    <MapPin size={14} aria-hidden="true" />
                    <span dir="auto">{session.physicalLocation}</span>
                  </>
                )}
              </span>
            ) : null}
          </div>
          {canManage ? (
            <div className="pd-specialist-session-card-actions">
              <button
                type="button"
                className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-session-action"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditOpen(true);
                }}
                aria-label={editLabel}
              >
                {editLabel}
              </button>
              <button
                type="button"
                className="pd-btn pd-btn-danger-outline pd-btn-sm pd-specialist-session-action"
                onClick={(event) => {
                  event.stopPropagation();
                  setCancelOpen(true);
                }}
                aria-label={cancelLabel}
              >
                {cancelLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {editOpen ? (
        <SpecialistSessionEditDialog
          open
          session={session}
          onClose={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            notifySpecialistSessionRefresh();
          }}
          onErrorRefresh={() => notifySpecialistSessionRefresh()}
        />
      ) : null}

      {cancelOpen ? (
        <SpecialistSessionCancelDialog
          open
          session={session}
          onClose={() => setCancelOpen(false)}
          onSuccess={() => {
            setCancelOpen(false);
            notifySpecialistSessionRefresh();
          }}
          onErrorRefresh={() => notifySpecialistSessionRefresh()}
        />
      ) : null}
    </article>
  );
}
