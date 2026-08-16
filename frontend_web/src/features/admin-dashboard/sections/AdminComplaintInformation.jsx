import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { AdminComplaintStatusBadge } from "../components/AdminComplaintStatusBadge";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

function InfoRow({ label, children }) {
  return (
    <div className="pd-admin-complaint-info-row">
      <span className="pd-admin-complaint-info-label">{label}</span>
      <span className="pd-admin-complaint-info-value">{children}</span>
    </div>
  );
}

export function AdminComplaintInformation({ complaint }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);

  if (!complaint) {
    return null;
  }

  return (
    <section
      className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter"
      aria-label={labels.complaintInformationAriaLabel}
    >
      <h2 className="pd-admin-complaint-section-title">{labels.complaintInformation}</h2>

      <div className="pd-admin-complaint-info-list">
        <InfoRow label={labels.columns.category}>{complaint.categoryLabel || labels.emptyDisplay}</InfoRow>
        <InfoRow label={labels.columns.status}>
          <AdminComplaintStatusBadge
            label={complaint.statusLabel}
            tone={complaint.statusTone}
          />
        </InfoRow>
        <InfoRow label={labels.columns.submitted}>
          {complaint.createdAtLabel || labels.emptyDisplay}
        </InfoRow>
        <InfoRow label={labels.reviewer}>
          <span dir="auto">{complaint.reviewedByName || labels.emptyDisplay}</span>
        </InfoRow>
        <InfoRow label={labels.reviewDate}>
          {complaint.reviewedAtLabel || labels.emptyDisplay}
        </InfoRow>
      </div>
    </section>
  );
}
