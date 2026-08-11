import { ChevronRight } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistPatientCard({ patient, onSelect }) {
  return (
    <li className="pd-specialist-patient-card-entry">
      <button
        type="button"
        className="pd-specialist-patient-card"
        onClick={() => onSelect?.(patient)}
      >
        <UserProfileAvatar
          imageUrl={patient.profileImageUrl}
          initials={getInitials(patient.name)}
          alt=""
          sizeClassName="pd-avatar-sm"
        />
        <span className="pd-specialist-patient-card-copy">
          <strong>{patient.name}</strong>
          {patient.diagnosis ? <span>{patient.diagnosis}</span> : null}
        </span>
        <ChevronRight size={18} aria-hidden="true" className="pd-specialist-patient-card-chevron" />
      </button>
    </li>
  );
}
