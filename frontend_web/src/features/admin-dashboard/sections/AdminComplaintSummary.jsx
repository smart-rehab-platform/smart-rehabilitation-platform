import { AdminComplaintStatusBadge } from "../components/AdminComplaintStatusBadge";
import { formatComplaintDateTimeLabel } from "../utils/adminComplaintsMappers";

export function AdminComplaintSummary({ complaint }) {
  if (!complaint) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-summary pd-section-enter" aria-label="Complaint summary">
      <div className="pd-admin-complaint-summary-top">
        <div className="pd-admin-complaint-summary-copy">
          <h1 className="pd-admin-complaint-summary-title">{complaint.categoryLabel}</h1>
          <p className="pd-admin-complaint-summary-meta">
            Submitted {formatComplaintDateTimeLabel(complaint.createdAt)}
          </p>
        </div>
        <AdminComplaintStatusBadge
          label={complaint.statusLabel}
          tone={complaint.statusTone}
        />
      </div>

      <dl className="pd-admin-complaint-summary-grid">
        <div>
          <dt>Parent</dt>
          <dd>{complaint.parentName || "—"}</dd>
        </div>
        <div>
          <dt>Child</dt>
          <dd>{complaint.patientName || "—"}</dd>
        </div>
        <div>
          <dt>Specialist</dt>
          <dd>{complaint.specialistName || "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
