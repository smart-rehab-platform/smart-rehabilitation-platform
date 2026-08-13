function PartyCard({ title, name }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter" aria-label={title}>
      <h2 className="pd-admin-complaint-section-title">{title}</h2>
      <p className="pd-admin-complaint-party-name">{name || "—"}</p>
    </section>
  );
}

export function AdminComplaintParties({ complaint }) {
  if (!complaint) {
    return null;
  }

  return (
    <div className="pd-admin-complaint-parties">
      <PartyCard title="Parent Information" name={complaint.parentName} />
      <PartyCard title="Child Information" name={complaint.patientName} />
      <PartyCard title="Specialist Information" name={complaint.specialistName} />
    </div>
  );
}
