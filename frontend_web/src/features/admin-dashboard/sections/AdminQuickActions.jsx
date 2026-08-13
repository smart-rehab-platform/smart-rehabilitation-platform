import assignUserLineIcon from "../../../assets/icons/clarity--assign-user-line.svg";
import arrowRightIcon from "../../../assets/icons/arrow_right_alt.svg";

export function AdminQuickActions({ onPatientAssignments }) {
  return (
    <section className="pd-admin-side-card pd-section-enter" aria-label="Quick actions">
      <button
        type="button"
        className="pd-admin-quick-action"
        onClick={onPatientAssignments}
      >
        <span className="pd-admin-quick-action-icon" aria-hidden="true">
          <img src={assignUserLineIcon} alt="" className="pd-platform-icon" />
        </span>
        <span className="pd-admin-quick-action-copy">
          <strong className="pd-admin-quick-action-title">Patient Assignments</strong>
          <span className="pd-admin-quick-action-sub">
            Assign specialists and link parents to patients
          </span>
        </span>
        <span className="pd-admin-quick-action-arrow" aria-hidden="true">
          <img src={arrowRightIcon} alt="" className="pd-platform-icon" />
        </span>
      </button>
    </section>
  );
}
