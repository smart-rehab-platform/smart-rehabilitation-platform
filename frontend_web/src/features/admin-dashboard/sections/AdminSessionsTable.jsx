import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getPatientInitials } from "../utils/adminPatientsMappers";
import { AdminSessionStatusBadge } from "../components/AdminSessionStatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getAdminSessionsLabels } from "../utils/adminSessionsLocalization.js";

function formatLocation(locationOrLink, emptyDisplay) {
  if (!locationOrLink || !String(locationOrLink).trim()) {
    return emptyDisplay;
  }

  return String(locationOrLink).trim();
}

function PatientCell({ session }) {
  return (
    <div className="pd-admin-sessions-patient-cell">
      <UserProfileAvatar
        imageUrl={session.patientProfileImageUrl}
        initials={getPatientInitials(session.patientName)}
        alt=""
        sizeClassName="pd-admin-sessions-avatar"
        shellClassName="pd-admin-sessions-avatar-shell"
        fallbackClassName="pd-admin-sessions-avatar-fallback"
        className="pd-avatar-photo"
      />
      <span className="pd-admin-sessions-patient-name" dir="auto">{session.patientName}</span>
    </div>
  );
}

function SessionActions({
  session,
  labels,
  onEditSession,
  onCompleteSession,
  onCancelSession,
  onNoShowSession,
}) {
  const patientName = session.patientName || labels.emptyDisplay;

  return (
    <div className="pd-admin-sessions-actions">
      <button
        type="button"
        className="pd-admin-sessions-action is-edit"
        onClick={() => onEditSession(session)}
        aria-label={labels.actionAria.edit(patientName)}
      >
        {labels.edit}
      </button>

      {session.isScheduled ? (
        <>
          <button
            type="button"
            className="pd-admin-sessions-action is-complete"
            onClick={() => onCompleteSession(session)}
            aria-label={labels.actionAria.complete(patientName)}
          >
            {labels.complete}
          </button>
          <button
            type="button"
            className="pd-admin-sessions-action is-cancel"
            onClick={() => onCancelSession(session)}
            aria-label={labels.actionAria.cancel(patientName)}
          >
            {labels.cancelSession}
          </button>
          <button
            type="button"
            className="pd-admin-sessions-action is-no-show"
            onClick={() => onNoShowSession(session)}
            aria-label={labels.actionAria.noShow(patientName)}
          >
            {labels.markNoShow}
          </button>
        </>
      ) : null}
    </div>
  );
}

function SkeletonRows({ labels }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-sessions-row-loading" aria-hidden="true">
          <td data-label={labels.columns.patient}>
            <div className="pd-admin-sessions-skeleton-patient">
              <span className="pd-admin-sessions-skeleton-avatar" />
              <span className="pd-admin-sessions-skeleton-line is-wide" />
            </div>
          </td>
          <td data-label={labels.columns.specialist}><span className="pd-admin-sessions-skeleton-line" /></td>
          <td data-label={labels.columns.dateTime}><span className="pd-admin-sessions-skeleton-line" /></td>
          <td data-label={labels.columns.duration}><span className="pd-admin-sessions-skeleton-line is-short" /></td>
          <td data-label={labels.columns.locationLink}><span className="pd-admin-sessions-skeleton-line is-wide" /></td>
          <td data-label={labels.columns.status}><span className="pd-admin-sessions-skeleton-chip" /></td>
          <td data-label={labels.columns.actions}><span className="pd-admin-sessions-skeleton-line is-short" /></td>
        </tr>
      ))}
    </>
  );
}

export function AdminSessionsTable({
  sessions,
  isLoading,
  emptyKind,
  onClearFilters,
  onEditSession,
  onCompleteSession,
  onCancelSession,
  onNoShowSession,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminSessionsLabels(t), [t]);

  if (isLoading) {
    return (
      <section className="pd-card pd-admin-sessions-table-wrap pd-section-enter" aria-busy="true">
        <table className="pd-admin-sessions-table">
          <thead>
            <tr>
              <th scope="col">{labels.columns.patient}</th>
              <th scope="col">{labels.columns.specialist}</th>
              <th scope="col">{labels.columns.dateTime}</th>
              <th scope="col">{labels.columns.duration}</th>
              <th scope="col">{labels.columns.locationLink}</th>
              <th scope="col">{labels.columns.status}</th>
              <th scope="col">{labels.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRows labels={labels} />
          </tbody>
        </table>
      </section>
    );
  }

  if (emptyKind === "no-sessions") {
    return (
      <section className="pd-card pd-card-pad pd-admin-sessions-empty pd-section-enter">
        <p className="pd-admin-sessions-empty-copy">{labels.empty}</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-sessions-empty pd-section-enter">
        <p className="pd-admin-sessions-empty-copy">{labels.emptyFiltered}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
          {labels.clearFilters}
        </button>
      </section>
    );
  }

  return (
    <section className="pd-card pd-admin-sessions-table-wrap pd-section-enter" aria-label={labels.tableAriaLabel}>
      <table className="pd-admin-sessions-table">
        <thead>
          <tr>
            <th scope="col">{labels.columns.patient}</th>
            <th scope="col">{labels.columns.specialist}</th>
            <th scope="col">{labels.columns.dateTime}</th>
            <th scope="col">{labels.columns.duration}</th>
            <th scope="col">{labels.columns.locationLink}</th>
            <th scope="col">{labels.columns.status}</th>
            <th scope="col">{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="pd-admin-sessions-row">
              <td data-label={labels.columns.patient}>
                <PatientCell session={session} />
              </td>
              <td data-label={labels.columns.specialist} dir="auto">{session.specialistName}</td>
              <td data-label={labels.columns.dateTime}>{session.scheduledAtLabel}</td>
              <td data-label={labels.columns.duration}>{session.durationLabel}</td>
              <td data-label={labels.columns.locationLink}>
                <span className="pd-admin-sessions-location" dir="auto">
                  {formatLocation(session.locationOrLink, labels.emptyDisplay)}
                </span>
              </td>
              <td data-label={labels.columns.status}>
                <AdminSessionStatusBadge label={session.statusLabel} tone={session.statusTone} />
              </td>
              <td data-label={labels.columns.actions}>
                <SessionActions
                  session={session}
                  labels={labels}
                  onEditSession={onEditSession}
                  onCompleteSession={onCompleteSession}
                  onCancelSession={onCancelSession}
                  onNoShowSession={onNoShowSession}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
