import { MessageCircle } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistPatientHeader({ patient, diagnosis, overallProgressPercent }) {
  return (
    <section className="pd-card pd-card-pad pd-specialist-patient-header">
      <div className="pd-specialist-patient-header-main">
        <UserProfileAvatar
          imageUrl={patient.profileImageUrl}
          initials={getInitials(patient.fullName)}
          alt=""
          sizeClassName="pd-specialist-patient-header-avatar"
        />
        <div className="pd-specialist-patient-header-copy">
          <h1 className="pd-specialist-patient-name">{patient.fullName}</h1>
          <p className="pd-specialist-patient-meta">
            {patient.age != null ? `${patient.age} years` : null}
            {patient.age != null && diagnosis ? " · " : null}
            {diagnosis || null}
          </p>
        </div>
      </div>
      <div className="pd-specialist-patient-progress">
        {overallProgressPercent == null ? (
          <p className="pd-section-sub">No progress data available yet.</p>
        ) : (
          <ProgressBar
            label="Overall Progress"
            percent={overallProgressPercent}
            tone="cyan"
          />
        )}
      </div>
    </section>
  );
}

export function SpecialistPatientMessageParentButton({ onClick, isLoading }) {
  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-specialist-message-parent-btn"
      onClick={onClick}
      disabled={isLoading}
    >
      <MessageCircle size={18} aria-hidden="true" />
      {isLoading ? "Opening..." : "Message Parent"}
    </button>
  );
}
