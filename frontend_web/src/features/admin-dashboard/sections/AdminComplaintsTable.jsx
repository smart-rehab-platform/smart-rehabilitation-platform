import { ChevronRight } from "lucide-react";
import { AdminComplaintStatusBadge } from "../components/AdminComplaintStatusBadge";
import { formatComplaintSubmittedLabel } from "../utils/adminComplaintsMappers";

function ViewAction({ onView }) {
  return (
    <button
      type="button"
      className="pd-btn pd-btn-soft pd-btn-compact pd-admin-complaints-view-btn"
      onClick={(event) => {
        event.stopPropagation();
        onView?.();
      }}
    >
      View
      <ChevronRight size={16} aria-hidden="true" />
    </button>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-complaints-row-loading" aria-hidden="true">
          <td><span className="pd-admin-complaints-skeleton-line is-wide" /></td>
          <td><span className="pd-admin-complaints-skeleton-line is-short" /></td>
          <td><span className="pd-admin-complaints-skeleton-line" /></td>
          <td><span className="pd-admin-complaints-skeleton-line" /></td>
          <td><span className="pd-admin-complaints-skeleton-line" /></td>
          <td><span className="pd-admin-complaints-skeleton-line is-short" /></td>
          <td><span className="pd-admin-complaints-skeleton-line is-short" /></td>
        </tr>
      ))}
    </>
  );
}

function ComplaintRow({ complaint, onView }) {
  return (
    <tr className="pd-admin-complaints-row">
      <td data-label="Category">
        <strong className="pd-admin-complaints-category">{complaint.categoryLabel}</strong>
      </td>
      <td data-label="Status">
        <AdminComplaintStatusBadge
          label={complaint.statusLabel}
          tone={complaint.statusTone}
        />
      </td>
      <td data-label="Parent">{complaint.parentName || "—"}</td>
      <td data-label="Child">{complaint.patientName || "—"}</td>
      <td data-label="Specialist">{complaint.specialistName || "—"}</td>
      <td data-label="Submitted">
        {formatComplaintSubmittedLabel(complaint.createdAt)}
      </td>
      <td data-label="View">
        <ViewAction onView={() => onView?.(complaint.id)} />
      </td>
    </tr>
  );
}

export function AdminComplaintsTable({
  complaints = [],
  isLoading = false,
  emptyKind = null,
  onViewComplaint,
  onClearFilters,
}) {
  if (isLoading) {
    return (
      <section className="pd-card pd-admin-complaints-table-wrap pd-section-enter" aria-busy="true">
        <table className="pd-admin-complaints-table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Parent</th>
              <th scope="col">Child</th>
              <th scope="col">Specialist</th>
              <th scope="col">Submitted</th>
              <th scope="col"><span className="pd-sr-only">View</span></th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRows />
          </tbody>
        </table>
      </section>
    );
  }

  if (emptyKind === "no-complaints") {
    return (
      <section className="pd-card pd-card-pad pd-admin-complaints-empty pd-section-enter">
        <p className="pd-admin-complaints-empty-copy">
          No complaints have been submitted yet.
        </p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-complaints-empty pd-section-enter">
        <p className="pd-admin-complaints-empty-copy">
          No complaints match your filters.
        </p>
        {onClearFilters ? (
          <button type="button" className="pd-btn pd-btn-soft" onClick={onClearFilters}>
            Clear filters
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className="pd-card pd-admin-complaints-table-wrap pd-section-enter" aria-label="Complaints list">
      <table className="pd-admin-complaints-table">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Status</th>
            <th scope="col">Parent</th>
            <th scope="col">Child</th>
            <th scope="col">Specialist</th>
            <th scope="col">Submitted</th>
            <th scope="col"><span className="pd-sr-only">View</span></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <ComplaintRow
              key={complaint.id}
              complaint={complaint}
              onView={onViewComplaint}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
