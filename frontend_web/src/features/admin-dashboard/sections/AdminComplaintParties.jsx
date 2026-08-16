import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminComplaintsLabels } from "../utils/adminComplaintsLocalization.js";

function PartyCard({ title, name, emptyDisplay }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter" aria-label={title}>
      <h2 className="pd-admin-complaint-section-title">{title}</h2>
      <p className="pd-admin-complaint-party-name" dir="auto">{name || emptyDisplay}</p>
    </section>
  );
}

export function AdminComplaintParties({ complaint }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminComplaintsLabels(t), [t]);

  if (!complaint) {
    return null;
  }

  return (
    <div className="pd-admin-complaint-parties">
      <PartyCard
        title={labels.parentInformation}
        name={complaint.parentName}
        emptyDisplay={labels.emptyDisplay}
      />
      <PartyCard
        title={labels.childInformation}
        name={complaint.patientName}
        emptyDisplay={labels.emptyDisplay}
      />
      <PartyCard
        title={labels.specialistInformation}
        name={complaint.specialistName}
        emptyDisplay={labels.emptyDisplay}
      />
    </div>
  );
}
