import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import assignUserLineIcon from "../../../assets/icons/clarity--assign-user-line.svg";
import arrowRightIcon from "../../../assets/icons/arrow_right_alt.svg";
import { useLocale } from "../../../context/useLocale.js";
import { buildAdminPatientAssignmentsPath } from "../../../routes/adminDashboardRoutes";
import { getAdminPatientDetailsLabels } from "../utils/adminPatientsLocalization.js";

export function AdminPatientActions({ patientId }) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientDetailsLabels(t), [t]);

  return (
    <section className="pd-admin-patient-actions pd-section-enter" aria-label={labels.assignmentsAriaLabel}>
      <button
        type="button"
        className="pd-admin-quick-action pd-admin-patient-assignments-action"
        onClick={() => navigate(buildAdminPatientAssignmentsPath(patientId))}
      >
        <span className="pd-admin-quick-action-icon" aria-hidden="true">
          <img src={assignUserLineIcon} alt="" className="pd-platform-icon" />
        </span>
        <span className="pd-admin-quick-action-copy">
          <strong className="pd-admin-quick-action-title">{labels.assignmentsTitle}</strong>
          <span className="pd-admin-quick-action-sub">
            {labels.assignmentsHint}
          </span>
        </span>
        <span className="pd-admin-quick-action-arrow" aria-hidden="true">
          <img src={arrowRightIcon} alt="" className="pd-platform-icon" />
        </span>
      </button>
    </section>
  );
}
