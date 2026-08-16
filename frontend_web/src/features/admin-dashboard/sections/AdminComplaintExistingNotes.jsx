import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

export function AdminComplaintExistingNotes({ adminNotes }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const notes = typeof adminNotes === "string" ? adminNotes.trim() : "";

  if (!notes) {
    return null;
  }

  return (
    <section
      className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter"
      aria-label={labels.adminNotesAriaLabel}
    >
      <h2 className="pd-admin-complaint-section-title">{labels.adminNotes}</h2>
      <p className="pd-admin-complaint-description" dir="auto">{notes}</p>
    </section>
  );
}
