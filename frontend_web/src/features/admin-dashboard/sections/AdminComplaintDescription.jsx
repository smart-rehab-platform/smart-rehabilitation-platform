import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

export function AdminComplaintDescription({ description }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);
  const text = typeof description === "string" ? description : "";
  const hasText = text.trim().length > 0;

  return (
    <section
      className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter"
      aria-label={labels.descriptionAriaLabel}
    >
      <h2 className="pd-admin-complaint-section-title">{labels.descriptionTitle}</h2>
      {hasText ? (
        <p className="pd-admin-complaint-description" dir="auto">{text}</p>
      ) : (
        <p className="pd-admin-complaint-empty-copy">{labels.emptyDisplay}</p>
      )}
    </section>
  );
}
