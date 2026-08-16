export function AdminExerciseInstructions({ labels, instructions }) {
  const trimmed = instructions?.trim() || "";
  const content = trimmed || labels.noInstructions;
  const isFallback = !trimmed;

  return (
    <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-section-enter" aria-label={labels.instructions}>
      <h2 className="pd-section-title">{labels.instructions}</h2>
      <p className="pd-admin-exercise-details-text" dir={isFallback ? undefined : "auto"}>{content}</p>
    </section>
  );
}
