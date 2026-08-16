import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { DonutChart } from "../../shared-dashboard/components/DonutChart";
import { getPatientInitials } from "../utils/adminPatientsMappers";
import { getAdminPatientDetailsLabels } from "../utils/adminPatientsLocalization.js";

export function AdminPatientOverview({ patient, conditionLabel, overallProgressPercent }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);
  const ageLabel = patient.age != null ? labels.ageYears(patient.age) : labels.ageUnknown;

  return (
    <section
      className="pd-card pd-card-pad pd-admin-patient-overview pd-section-enter"
      aria-label={labels.overviewAriaLabel}
    >
      <div className="pd-admin-patient-overview-main">
        <UserProfileAvatar
          imageUrl={patient.profileImageUrl}
          initials={getPatientInitials(patient.fullName)}
          alt=""
          sizeClassName="pd-admin-patient-overview-avatar"
          shellClassName="pd-admin-patient-overview-avatar-shell"
          fallbackClassName="pd-admin-patient-overview-avatar-fallback"
          className="pd-avatar-photo"
        />
        <div className="pd-admin-patient-overview-copy">
          <h1 className="pd-admin-patient-overview-name">{patient.fullName}</h1>
          <p className="pd-admin-patient-overview-meta">
            {ageLabel}
            {" · "}
            {conditionLabel}
          </p>
        </div>
      </div>
      <div className="pd-admin-patient-overview-progress" aria-label={labels.overallProgressAriaLabel}>
        <DonutChart
          percent={overallProgressPercent}
          label={labels.overallProgress}
          size={140}
          animationKey={patient.id}
        />
      </div>
    </section>
  );
}

export function AdminPatientOverviewSkeleton() {
  return (
    <section className="pd-card pd-card-pad pd-admin-patient-overview pd-admin-patient-skeleton-card" aria-hidden="true">
      <div className="pd-admin-patient-overview-main">
        <span className="pd-admin-patient-skeleton-avatar" />
        <div className="pd-admin-patient-skeleton-lines">
          <span className="pd-admin-patient-skeleton-line is-wide" />
          <span className="pd-admin-patient-skeleton-line" />
        </div>
      </div>
      <span className="pd-admin-patient-skeleton-ring" />
    </section>
  );
}
