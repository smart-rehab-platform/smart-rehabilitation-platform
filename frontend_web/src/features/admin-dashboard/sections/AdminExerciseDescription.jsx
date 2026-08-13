export function AdminExerciseDescription({ description }) {
  const content = description?.trim() || "No description available.";

  return (
    <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-section-enter" aria-label="Description">
      <h2 className="pd-section-title">Description</h2>
      <p className="pd-admin-exercise-details-text">{content}</p>
    </section>
  );
}
