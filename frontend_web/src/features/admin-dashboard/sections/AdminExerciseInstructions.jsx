export function AdminExerciseInstructions({ instructions }) {
  const content = instructions?.trim() || "No instructions available.";

  return (
    <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-section-enter" aria-label="Instructions">
      <h2 className="pd-section-title">Instructions</h2>
      <p className="pd-admin-exercise-details-text">{content}</p>
    </section>
  );
}
