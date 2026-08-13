import { ExternalLink, MapPin } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistSessionCard({ session }) {
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
            <strong className="pd-specialist-session-card-patient">{session.patientName}</strong>
            <StatusBadge label={session.displayStatus.label} tone={session.displayStatus.tone} />
          </div>
          <p className="pd-specialist-session-card-type">{session.sessionType}</p>
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
                      Meeting link
                    </a>
                  </>
                ) : (
                  <>
                    <MapPin size={14} aria-hidden="true" />
                    {session.physicalLocation}
                  </>
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
