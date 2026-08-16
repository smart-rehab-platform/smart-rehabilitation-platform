import { MessageCircle } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { formatPatientAgeDiagnosisMeta } from "../utils/specialistPatientsLocalization";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistPatientHeader({ patient, diagnosis, overallProgressPercent }) {
  const { t } = useLocale();

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
          <h1 className="pd-specialist-patient-name" dir="auto">{patient.fullName}</h1>
          <p className="pd-specialist-patient-meta" dir="auto">
            {formatPatientAgeDiagnosisMeta(patient.age, diagnosis, t)}
          </p>
        </div>
      </div>
      <div className="pd-specialist-patient-progress">
        {overallProgressPercent == null ? (
          <p className="pd-section-sub">{t("specialist.patientDetails.noProgressData")}</p>
        ) : (
          <ProgressBar
            label={t("specialist.patientDetails.overallProgress")}
            percent={overallProgressPercent}
            tone="cyan"
          />
        )}
      </div>
    </section>
  );
}

export function SpecialistPatientMessageParentButton({ onClick, isLoading }) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-specialist-message-parent-btn"
      onClick={onClick}
      disabled={isLoading}
    >
      <MessageCircle size={18} aria-hidden="true" />
      {isLoading ? t("specialist.patientDetails.openingConversation") : t("specialist.patientDetails.messageParent")}
    </button>
  );
}
