import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistAiPatientHeader({ patientName }) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-specialist-ai-patient-header">
      <div className="pd-specialist-ai-patient-header-body">
        <UserProfileAvatar
          imageUrl={null}
          initials={getInitials(patientName, "P")}
          alt=""
          shellClassName="pd-avatar pd-specialist-ai-patient-avatar"
          fallbackClassName="pd-avatar pd-specialist-ai-patient-avatar"
          className="pd-avatar-photo"
        />
        <div className="pd-specialist-ai-patient-header-copy">
          <h2 className="pd-specialist-ai-patient-name">{patientName}</h2>
          <p className="pd-specialist-ai-patient-subtitle">{t("specialist.aiRecommendations.patientSubtitle")}</p>
        </div>
      </div>
    </section>
  );
}
