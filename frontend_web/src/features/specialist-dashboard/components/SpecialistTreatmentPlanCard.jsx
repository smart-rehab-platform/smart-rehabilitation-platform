import { ChevronRight, ClipboardList } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";

export function SpecialistTreatmentPlanCard({ plan, onClick }) {
  return (
    <button
      type="button"
      className={`pd-card pd-card-pad pd-specialist-treatment-plan-card pd-specialist-treatment-plan-card--${plan.iconTone}`}
      onClick={() => onClick?.(plan)}
    >
      <span className={`pd-specialist-treatment-plan-card-icon pd-specialist-treatment-plan-card-icon--${plan.iconTone}`}>
        <ClipboardList size={20} aria-hidden="true" />
      </span>
      <span className="pd-specialist-treatment-plan-card-copy">
        <strong dir="auto">{plan.title}</strong>
        <span className="pd-specialist-treatment-plan-card-patient" dir="auto">{plan.patientName}</span>
        <span className="pd-specialist-treatment-plan-card-meta">
          <StatusBadge label={plan.statusLabel} tone={plan.statusTone} />
          <span className="pd-section-sub">{plan.dateRangeLabel}</span>
        </span>
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}
