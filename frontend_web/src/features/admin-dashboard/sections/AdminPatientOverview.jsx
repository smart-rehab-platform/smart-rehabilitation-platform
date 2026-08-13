import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { DonutChart } from "../../shared-dashboard/components/DonutChart";
import { getPatientInitials } from "../utils/adminPatientsMappers";

export function AdminPatientOverview({ patient, conditionLabel, overallProgressPercent }) {
  const ageLabel = patient.age != null ? `Age ${patient.age} yrs` : "Age —";

  return (
    <section className="pd-card pd-card-pad pd-admin-patient-overview pd-section-enter" aria-label="Patient overview">
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
      <div className="pd-admin-patient-overview-progress" aria-label="Overall progress">
        <DonutChart
          percent={overallProgressPercent}
          label="Overall Progress"
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
