import { Lock } from "lucide-react";
import { useLocale } from "../../../context/useLocale";

export function SpecialistTreatmentPlanPatientPicker({
  open,
  patients,
  activePatientIds,
  onClose,
  onSelect,
}) {
  const { t } = useLocale();

  if (!open) {
    return null;
  }

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="pd-modal pd-specialist-treatment-plan-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-treatment-plan-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-treatment-plan-picker-title" className="pd-modal-title">
          {t("specialist.treatmentPlans.picker.title")}
        </h2>
        {patients.length === 0 ? (
          <p className="pd-section-sub">{t("specialist.treatmentPlans.picker.noPatients")}</p>
        ) : (
          <ul className="pd-specialist-treatment-plan-picker-list">
            {patients.map((patient) => {
              const hasActive = activePatientIds.has(patient.id);
              return (
                <li key={patient.id}>
                  <button
                    type="button"
                    className={`pd-specialist-treatment-plan-picker-item${hasActive ? " is-disabled" : ""}`}
                    disabled={hasActive}
                    onClick={() => onSelect?.(patient)}
                  >
                    <span className="pd-specialist-treatment-plan-picker-copy">
                      <strong dir="auto">{patient.name}</strong>
                      <span className="pd-section-sub">
                        {hasActive
                          ? t("specialist.treatmentPlans.picker.hasActivePlan")
                          : t("specialist.treatmentPlans.picker.noActivePlan")}
                      </span>
                    </span>
                    {hasActive ? (
                      <Lock size={16} aria-hidden="true" />
                    ) : (
                      <ChevronRightPlaceholder />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div className="pd-modal-actions">
          <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronRightPlaceholder() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
