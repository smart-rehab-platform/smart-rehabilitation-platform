import { getPatientInitials } from "../utils/adminPatientsMappers";
import { AdminSessionStatusBadge } from "../components/AdminSessionStatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

function formatSessionDateTime(scheduledAt) {
  if (!scheduledAt) {
    return "—";
  }

  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} • ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDuration(minutes) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes)) {
    return "—";
  }

  return `${minutes} min`;
}

function formatLocation(locationOrLink) {
  if (!locationOrLink || !String(locationOrLink).trim()) {
    return "—";
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
      <span className="pd-admin-sessions-patient-name">{session.patientName}</span>
    </div>
  );
}

function SessionActions({
  session,
  onEditSession,
  onCompleteSession,
  onCancelSession,
  onNoShowSession,
}) {
  const patientName = session.patientName || "patient";

  return (
    <div className="pd-admin-sessions-actions">
      <button
        type="button"
        className="pd-admin-sessions-action is-edit"
        onClick={() => onEditSession(session)}
        aria-label={`Edit session for ${patientName}`}
      >
        Edit
      </button>

      {session.isScheduled ? (
        <>
          <button
            type="button"
            className="pd-admin-sessions-action is-complete"
            onClick={() => onCompleteSession(session)}
            aria-label={`Complete session for ${patientName}`}
          >
            Complete
          </button>
          <button
            type="button"
            className="pd-admin-sessions-action is-cancel"
            onClick={() => onCancelSession(session)}
            aria-label={`Cancel session for ${patientName}`}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pd-admin-sessions-action is-no-show"
            onClick={() => onNoShowSession(session)}
            aria-label={`Mark session as no show for ${patientName}`}
          >
            No Show
          </button>
        </>
      ) : null}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-sessions-row-loading" aria-hidden="true">
          <td data-label="Patient">
            <div className="pd-admin-sessions-skeleton-patient">
              <span className="pd-admin-sessions-skeleton-avatar" />
              <span className="pd-admin-sessions-skeleton-line is-wide" />
            </div>
          </td>
          <td data-label="Specialist"><span className="pd-admin-sessions-skeleton-line" /></td>
          <td data-label="Date & Time"><span className="pd-admin-sessions-skeleton-line" /></td>
          <td data-label="Duration"><span className="pd-admin-sessions-skeleton-line is-short" /></td>
          <td data-label="Location / Link"><span className="pd-admin-sessions-skeleton-line is-wide" /></td>
          <td data-label="Status"><span className="pd-admin-sessions-skeleton-chip" /></td>
          <td data-label="Actions"><span className="pd-admin-sessions-skeleton-line is-short" /></td>
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
  if (isLoading) {
    return (
      <section className="pd-card pd-admin-sessions-table-wrap pd-section-enter" aria-busy="true">
        <table className="pd-admin-sessions-table">
          <thead>
            <tr>
              <th scope="col">Patient</th>
              <th scope="col">Specialist</th>
              <th scope="col">Date &amp; Time</th>
              <th scope="col">Duration</th>
              <th scope="col">Location / Link</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRows />
          </tbody>
        </table>
      </section>
    );
  }

  if (emptyKind === "no-sessions") {
    return (
      <section className="pd-card pd-card-pad pd-admin-sessions-empty pd-section-enter">
        <p className="pd-admin-sessions-empty-copy">No sessions found.</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-sessions-empty pd-section-enter">
        <p className="pd-admin-sessions-empty-copy">No sessions match your search or filter.</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
          Clear filters
        </button>
      </section>
    );
  }

  return (
    <section className="pd-card pd-admin-sessions-table-wrap pd-section-enter" aria-label="Sessions list">
      <table className="pd-admin-sessions-table">
        <thead>
          <tr>
            <th scope="col">Patient</th>
            <th scope="col">Specialist</th>
            <th scope="col">Date &amp; Time</th>
            <th scope="col">Duration</th>
            <th scope="col">Location / Link</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="pd-admin-sessions-row">
              <td data-label="Patient">
                <PatientCell session={session} />
              </td>
              <td data-label="Specialist">{session.specialistName}</td>
              <td data-label="Date & Time">{formatSessionDateTime(session.scheduledAt)}</td>
              <td data-label="Duration">{formatDuration(session.durationMinutes)}</td>
              <td data-label="Location / Link">
                <span className="pd-admin-sessions-location">{formatLocation(session.locationOrLink)}</span>
              </td>
              <td data-label="Status">
                <AdminSessionStatusBadge label={session.statusLabel} tone={session.statusTone} />
              </td>
              <td data-label="Actions">
                <SessionActions
                  session={session}
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
