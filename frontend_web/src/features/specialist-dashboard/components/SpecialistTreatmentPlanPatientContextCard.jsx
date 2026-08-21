import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistTreatmentPlanPatientContextCard({
  patientName,
  profileImageUrl = null,
  planTitle = "",
  statusLabel,
  statusTone = "success",
}) {
  const resolvedPlanTitle = typeof planTitle === "string" ? planTitle.trim() : "";

  return (
    <div className="pd-specialist-treatment-plan-edit-patient-identity">
      <UserProfileAvatar
        imageUrl={profileImageUrl}
        initials={getInitials(patientName, "P")}
        alt=""
        shellClassName="pd-avatar pd-specialist-treatment-plan-edit-patient-identity-avatar"
        fallbackClassName="pd-avatar pd-specialist-treatment-plan-edit-patient-identity-avatar"
        className="pd-avatar-photo"
      />
      <div className="pd-specialist-treatment-plan-edit-patient-identity-copy">
        <div className="pd-specialist-treatment-plan-edit-patient-identity-name-row">
          <strong className="pd-specialist-treatment-plan-edit-patient-identity-name" dir="auto">
            {patientName}
          </strong>
          {statusLabel ? (
            <StatusBadge label={statusLabel} tone={statusTone} />
          ) : null}
        </div>
        {resolvedPlanTitle ? (
          <p className="pd-specialist-treatment-plan-edit-patient-identity-plan" dir="auto">
            {resolvedPlanTitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
