import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminPatientsLabels } from "../utils/adminPatientsLocalization.js";

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

function PreviousSessionCell({ session, labels }) {
  if (!session?.id) {
    return <span className="pd-admin-patients-muted">{labels.noPreviousSession}</span>;
  }

  return (
    <div className="pd-admin-patients-session-cell">
      <span className="pd-admin-patients-session-date">
        {session.scheduledAtLabel || labels.unknownDate}
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
      <span className="pd-admin-patients-name" dir="auto">{patient.fullName}</span>
    </div>
  );
}

function ViewAction({ onView, label }) {
  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-btn-compact pd-admin-patients-view-btn"
      onClick={(event) => {
        event.stopPropagation();
        onView();
      }}
    >
      {label}
      <ChevronRight size={16} aria-hidden="true" className="pd-admin-patients-view-chevron" />
    </button>
  );
}

function PatientRow({ patient, labels, onView }) {
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
      aria-label={labels.viewDetailsAria(patient.fullName)}
    >
      <td data-label={labels.columns.patient}>
        <PatientIdentity patient={patient} />
      </td>
      <td data-label={labels.columns.gender}>{patient.genderLabel}</td>
      <td data-label={labels.columns.condition}>
        <ConditionBadge label={patient.conditionLabel} hasCondition={patient.hasCondition} />
      </td>
      <td data-label={labels.columns.previousSession}>
        <PreviousSessionCell session={patient.previousSession} labels={labels} />
      </td>
      <td data-label={labels.columns.view}>
        <ViewAction onView={onView} label={labels.view} />
      </td>
    </tr>
  );
}

function LoadingRows({ loadingLabel }) {
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
            <span className="pd-sr-only">{loadingLabel}</span>
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
  const { t } = useLocale();
  const labels = useMemo(() => getAdminPatientsLabels(t), [t]);

  return (
    <section className="pd-card pd-admin-patients-table-wrap pd-section-enter" aria-label={labels.tableAriaLabel}>
      <div className="pd-admin-patients-table-scroll">
        <table className="pd-admin-patients-table">
          <thead>
            <tr>
              <th scope="col">{labels.columns.patient}</th>
              <th scope="col">{labels.columns.gender}</th>
              <th scope="col">{labels.columns.condition}</th>
              <th scope="col">{labels.columns.previousSession}</th>
              <th scope="col">{labels.columns.view}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows loadingLabel={labels.loading} />
            ) : emptyKind ? (
              <tr className="pd-admin-patients-empty-row">
                <td colSpan={5}>
                  <p className="pd-admin-empty-copy">
                    {emptyKind === "no-patients" ? labels.empty : labels.emptyFiltered}
                  </p>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  labels={labels}
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
