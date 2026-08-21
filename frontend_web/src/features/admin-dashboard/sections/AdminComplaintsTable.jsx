import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { AdminComplaintStatusBadge } from "../components/AdminComplaintStatusBadge";
import { AdminTablePrimaryAction } from "../components/AdminTablePrimaryAction";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

function ViewAction({ onView, label }) {
  return (
    <AdminTablePrimaryAction
      className="pd-admin-complaints-view-btn"
      onClick={(event) => {
        event.stopPropagation();
        onView?.();
      }}
    >
      {label}
      <ChevronRight size={16} aria-hidden="true" className="pd-admin-complaints-view-chevron" />
    </AdminTablePrimaryAction>
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

function ComplaintRow({ complaint, labels, onView }) {
  const emptyDisplay = labels.emptyDisplay;

  return (
    <tr className="pd-admin-complaints-row">
      <td data-label={labels.columns.category}>
        <strong className="pd-admin-complaints-category">{complaint.categoryLabel}</strong>
      </td>
      <td data-label={labels.columns.status}>
        <AdminComplaintStatusBadge
          label={complaint.statusLabel}
          tone={complaint.statusTone}
        />
      </td>
      <td data-label={labels.columns.parent} dir="auto">{complaint.parentName || emptyDisplay}</td>
      <td data-label={labels.columns.patient} dir="auto">{complaint.patientName || emptyDisplay}</td>
      <td data-label={labels.columns.specialist} dir="auto">{complaint.specialistName || emptyDisplay}</td>
      <td data-label={labels.columns.submitted}>
        {complaint.createdAtLabel || emptyDisplay}
      </td>
      <td data-label={labels.columns.view}>
        <ViewAction label={labels.view} onView={() => onView?.(complaint.id)} />
      </td>
    </tr>
  );
}

export function AdminComplaintsTable({
  complaints = [],
  isLoading = false,
  emptyKind = null,
  onViewComplaint,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);

  if (isLoading) {
    return (
      <section className="pd-card pd-admin-complaints-table-wrap pd-section-enter" aria-busy="true">
        <table className="pd-admin-complaints-table">
          <thead>
            <tr>
              <th scope="col">{labels.columns.category}</th>
              <th scope="col">{labels.columns.status}</th>
              <th scope="col">{labels.columns.parent}</th>
              <th scope="col">{labels.columns.patient}</th>
              <th scope="col">{labels.columns.specialist}</th>
              <th scope="col">{labels.columns.submitted}</th>
              <th scope="col"><span className="pd-sr-only">{labels.columns.view}</span></th>
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
        <p className="pd-admin-complaints-empty-copy">{labels.empty}</p>
      </section>
    );
  }

  if (emptyKind === "no-matches") {
    return (
      <section className="pd-card pd-card-pad pd-admin-complaints-empty pd-section-enter">
        <p className="pd-admin-complaints-empty-copy">{labels.emptyFiltered}</p>
      </section>
    );
  }

  return (
    <section className="pd-card pd-admin-complaints-table-wrap pd-section-enter" aria-label={labels.tableAriaLabel}>
      <table className="pd-admin-complaints-table">
        <thead>
          <tr>
            <th scope="col">{labels.columns.category}</th>
            <th scope="col">{labels.columns.status}</th>
            <th scope="col">{labels.columns.parent}</th>
            <th scope="col">{labels.columns.patient}</th>
            <th scope="col">{labels.columns.specialist}</th>
            <th scope="col">{labels.columns.submitted}</th>
            <th scope="col"><span className="pd-sr-only">{labels.columns.view}</span></th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <ComplaintRow
              key={complaint.id}
              complaint={complaint}
              labels={labels}
              onView={onViewComplaint}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}
