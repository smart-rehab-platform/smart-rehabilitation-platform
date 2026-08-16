import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistTreatmentPlanPatientSummary({
  patientName,
  patientAge = null,
  overallProgressPercent = null,
  statusLabel,
  statusTone = "success",
  showProgress = true,
}) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-specialist-treatment-plan-summary-card">
      <h2 className="pd-specialist-treatment-plan-summary-title">{t("specialist.treatmentPlans.patientSummary.title")}</h2>
      <div className="pd-specialist-treatment-plan-summary-body">
        <div className="pd-specialist-treatment-plan-summary-identity">
          <UserProfileAvatar
            imageUrl={null}
            initials={getInitials(patientName, "P")}
            alt=""
            shellClassName="pd-avatar pd-specialist-treatment-plan-patient-avatar"
            fallbackClassName="pd-avatar pd-specialist-treatment-plan-patient-avatar"
            className="pd-avatar-photo"
          />
          <div className="pd-specialist-treatment-plan-summary-identity-copy">
            <strong className="pd-specialist-treatment-plan-patient-name" dir="auto">{patientName}</strong>
            {patientAge != null ? (
              <p className="pd-specialist-treatment-plan-summary-age">
                {t("specialist.treatmentPlans.patientSummary.ageYears", { count: patientAge })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="pd-specialist-treatment-plan-summary-metrics">
          {showProgress ? (
            <div className="pd-specialist-treatment-plan-summary-progress">
              {overallProgressPercent == null ? (
                <p className="pd-section-sub">{t("specialist.treatmentPlans.patientSummary.noProgress")}</p>
              ) : (
                <ProgressBar
                  label={t("specialist.treatmentPlans.patientSummary.overallProgress")}
                  percent={overallProgressPercent}
                  tone="cyan"
                />
              )}
            </div>
          ) : null}
          {statusLabel ? (
            <StatusBadge label={statusLabel} tone={statusTone} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
