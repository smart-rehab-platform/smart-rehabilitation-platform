export function AdminComplaintDescription({ description }) {
  const text = typeof description === "string" ? description : "";
  const hasText = text.trim().length > 0;

  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter" aria-label="Complaint description">
      <h2 className="pd-admin-complaint-section-title">Complaint Description</h2>
      {hasText ? (
        <p className="pd-admin-complaint-description">{text}</p>
      ) : (
        <p className="pd-admin-complaint-empty-copy">—</p>
      )}
    </section>
  );
}
