import { ChevronRight } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

function ConditionBadge({ label, hasCondition }) {
  if (!hasCondition) {
    return <span className="pd-admin-patients-muted">{label}</span>;
  }

  return <span className="pd-admin-patients-condition">{label}</span>;
}

function SessionStatusBadge({ session }) {
  if (!session) {
    return null;
  }

  return (
    <span className={`pd-admin-patients-session-status is-${session.statusTone}`}>
      {session.statusLabel}
    </span>
  );
}

function PreviousSessionCell({ session }) {
  if (!session?.id) {
    return <span className="pd-admin-patients-muted">No previous session</span>;
  }

  return (
    <div className="pd-admin-patients-session-cell">
      <span className="pd-admin-patients-session-date">
        {session.scheduledAtLabel || "Unknown date"}
      </span>
      <SessionStatusBadge session={session} />
    </div>
  );
}

function PatientIdentity({ patient }) {
  return (
    <div className="pd-admin-patients-user-cell">
      <UserProfileAvatar
        imageUrl={patient.profileImageUrl}
        initials={patient.initials}
        alt=""
        sizeClassName="pd-admin-patients-avatar"
        shellClassName="pd-admin-patients-avatar-shell"
        fallbackClassName="pd-admin-patients-avatar-fallback"
        className="pd-avatar-photo"
      />
      <span className="pd-admin-patients-name">{patient.fullName}</span>
    </div>
  );
}

function ViewAction({ onView }) {
  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-btn-compact pd-admin-patients-view-btn"
      onClick={(event) => {
        event.stopPropagation();
        onView();
      }}
    >
      View
      <ChevronRight size={16} aria-hidden="true" />
    </button>
  );
}

function PatientRow({ patient, onView }) {
  return (
    <tr
      className="pd-admin-patients-row pd-admin-patients-row-clickable"
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`View details for ${patient.fullName}`}
    >
      <td data-label="Patient">
        <PatientIdentity patient={patient} />
      </td>
      <td data-label="Gender">{patient.genderLabel}</td>
      <td data-label="Condition">
        <ConditionBadge label={patient.conditionLabel} hasCondition={patient.hasCondition} />
      </td>
      <td data-label="Previous Session">
        <PreviousSessionCell session={patient.previousSession} />
      </td>
      <td data-label="View">
        <ViewAction onView={onView} />
      </td>
    </tr>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-patients-row pd-admin-patients-row-loading">
          <td colSpan={5}>
            <div className="pd-admin-patients-skeleton-row" aria-hidden="true">
              <span className="pd-admin-patients-skeleton-avatar" />
              <span className="pd-admin-patients-skeleton-lines">
                <span className="pd-admin-patients-skeleton-line is-wide" />
                <span className="pd-admin-patients-skeleton-line" />
              </span>
            </div>
            <span className="pd-sr-only">Loading patients...</span>
          </td>
        </tr>
      ))}
    </>
  );
}

export function AdminPatientsTable({
  patients,
  isLoading = false,
  emptyKind = null,
  onViewPatient,
}) {
  return (
    <section className="pd-card pd-admin-patients-table-wrap pd-section-enter" aria-label="Patients list">
      <div className="pd-admin-patients-table-scroll">
        <table className="pd-admin-patients-table">
          <thead>
            <tr>
              <th scope="col">Patient</th>
              <th scope="col">Gender</th>
              <th scope="col">Condition</th>
              <th scope="col">Previous Session</th>
              <th scope="col">View</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows />
            ) : emptyKind ? (
              <tr className="pd-admin-patients-empty-row">
                <td colSpan={5}>
                  <p className="pd-admin-empty-copy">
                    {emptyKind === "no-patients"
                      ? "No patients have been registered yet."
                      : "No patients match your search or filter."}
                  </p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  onView={() => onViewPatient(patient.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
