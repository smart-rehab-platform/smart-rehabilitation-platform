import { useMemo } from "react";
import assignUserLineIcon from "../../../assets/icons/clarity--assign-user-line.svg";
import arrowRightIcon from "../../../assets/icons/arrow_right_alt.svg";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminQuickActionsLabels } from "../utils/adminDashboardLocalization.js";

export function AdminQuickActions({ onPatientAssignments }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminQuickActionsLabels(t), [t]);

  return (
    <section className="pd-admin-side-card pd-section-enter" aria-label={labels.sectionAriaLabel}>
      <button
        type="button"
        className="pd-admin-quick-action"
        onClick={onPatientAssignments}
      >
        <span className="pd-admin-quick-action-icon" aria-hidden="true">
          <img src={assignUserLineIcon} alt="" className="pd-platform-icon" />
        </span>
        <span className="pd-admin-quick-action-copy">
          <strong className="pd-admin-quick-action-title">{labels.patientAssignments}</strong>
          <span className="pd-admin-quick-action-sub">
            {labels.patientAssignmentsHint}
          </span>
        </span>
        <span className="pd-admin-quick-action-arrow" aria-hidden="true">
          <img src={arrowRightIcon} alt="" className="pd-platform-icon" />
        </span>
      </button>
    </section>
  );
}
