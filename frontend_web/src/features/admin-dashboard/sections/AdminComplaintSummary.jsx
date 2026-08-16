import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { AdminComplaintStatusBadge } from "../components/AdminComplaintStatusBadge";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

export function AdminComplaintSummary({ complaint }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);

  if (!complaint) {
    return null;
  }

  const submittedLabel = complaint.createdAtLabel
    ? labels.submittedAt(complaint.createdAtLabel)
    : labels.emptyDisplay;

  return (
    <section
      className="pd-card pd-card-pad pd-admin-complaint-summary pd-section-enter"
      aria-label={labels.summaryAriaLabel}
    >
      <div className="pd-admin-complaint-summary-top">
        <div className="pd-admin-complaint-summary-copy">
          <h1 className="pd-admin-complaint-summary-title">{complaint.categoryLabel}</h1>
          <p className="pd-admin-complaint-summary-meta">{submittedLabel}</p>
        </div>
        <AdminComplaintStatusBadge
          label={complaint.statusLabel}
          tone={complaint.statusTone}
        />
      </div>

      <dl className="pd-admin-complaint-summary-grid">
        <div>
          <dt>{labels.columns.parent}</dt>
          <dd dir="auto">{complaint.parentName || labels.emptyDisplay}</dd>
        </div>
        <div>
          <dt>{labels.columns.patient}</dt>
          <dd dir="auto">{complaint.patientName || labels.emptyDisplay}</dd>
        </div>
        <div>
          <dt>{labels.columns.specialist}</dt>
          <dd dir="auto">{complaint.specialistName || labels.emptyDisplay}</dd>
        </div>
      </dl>
    </section>
  );
}
