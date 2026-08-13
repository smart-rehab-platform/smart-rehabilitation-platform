import { useNavigate } from "react-router-dom";
import assignUserLineIcon from "../../../assets/icons/clarity--assign-user-line.svg";
import arrowRightIcon from "../../../assets/icons/arrow_right_alt.svg";
import { buildAdminPatientAssignmentsPath } from "../../../routes/adminDashboardRoutes";

export function AdminPatientActions({ patientId }) {
  const navigate = useNavigate();

  return (
    <section className="pd-admin-patient-actions pd-section-enter" aria-label="Patient actions">
      <button
        type="button"
        className="pd-admin-quick-action pd-admin-patient-assignments-action"
        onClick={() => navigate(buildAdminPatientAssignmentsPath(patientId))}
      >
        <span className="pd-admin-quick-action-icon" aria-hidden="true">
          <img src={assignUserLineIcon} alt="" className="pd-platform-icon" />
        </span>
        <span className="pd-admin-quick-action-copy">
          <strong className="pd-admin-quick-action-title">Patient Assignments</strong>
          <span className="pd-admin-quick-action-sub">
            Manage linked specialists and parents
          </span>
        </span>
        <span className="pd-admin-quick-action-arrow" aria-hidden="true">
          <img src={arrowRightIcon} alt="" className="pd-platform-icon" />
        </span>
      </button>
    </section>
  );
}
