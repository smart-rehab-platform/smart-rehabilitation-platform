import { AdminComplaintStatusBadge } from "../components/AdminComplaintStatusBadge";
import { formatComplaintDateTimeLabel } from "../utils/adminComplaintsMappers";

function InfoRow({ label, children }) {
  return (
    <div className="pd-admin-complaint-info-row">
      <span className="pd-admin-complaint-info-label">{label}</span>
      <span className="pd-admin-complaint-info-value">{children}</span>
    </div>
  );
}

export function AdminComplaintInformation({ complaint }) {
  if (!complaint) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter" aria-label="Complaint information">
      <h2 className="pd-admin-complaint-section-title">Complaint Information</h2>

      <div className="pd-admin-complaint-info-list">
        <InfoRow label="Category">{complaint.categoryLabel || "—"}</InfoRow>
        <InfoRow label="Status">
          <AdminComplaintStatusBadge
            label={complaint.statusLabel}
            tone={complaint.statusTone}
          />
        </InfoRow>
        <InfoRow label="Submitted">
          {formatComplaintDateTimeLabel(complaint.createdAt)}
        </InfoRow>
        <InfoRow label="Reviewer">{complaint.reviewedByName || "—"}</InfoRow>
        <InfoRow label="Review date">
          {complaint.reviewedAt ? formatComplaintDateTimeLabel(complaint.reviewedAt) : "—"}
        </InfoRow>
      </div>
    </section>
  );
}
