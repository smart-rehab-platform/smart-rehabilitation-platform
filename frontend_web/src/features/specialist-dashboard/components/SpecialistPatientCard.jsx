import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistPatientCard({ patient, onSelect }) {
  const { t } = useLocale();

  return (
    <li className="pd-specialist-patient-card-entry">
      <button
        type="button"
        className="pd-specialist-patient-card"
        onClick={() => onSelect?.(patient)}
        aria-label={t("specialist.patients.cardAriaLabel", { name: patient.name })}
      >
        <UserProfileAvatar
          imageUrl={patient.profileImageUrl}
          initials={getInitials(patient.name)}
          alt=""
          sizeClassName="pd-avatar-sm"
        />
        <span className="pd-specialist-patient-card-copy">
          <strong dir="auto">{patient.name}</strong>
          {patient.diagnosis ? <span dir="auto">{patient.diagnosis}</span> : null}
        </span>
        <ChevronRight size={18} aria-hidden="true" className="pd-specialist-patient-card-chevron" />
      </button>
    </li>
  );
}
