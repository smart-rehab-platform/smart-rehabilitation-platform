export function AdminComplaintExistingNotes({ adminNotes }) {
  const notes = typeof adminNotes === "string" ? adminNotes.trim() : "";

  if (!notes) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter" aria-label="Admin notes">
      <h2 className="pd-admin-complaint-section-title">Admin Notes</h2>
      <p className="pd-admin-complaint-description">{notes}</p>
    </section>
  );
}
