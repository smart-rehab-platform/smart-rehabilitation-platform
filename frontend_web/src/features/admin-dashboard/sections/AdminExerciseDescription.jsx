export function AdminExerciseDescription({ labels, description }) {
  const trimmed = description?.trim() || "";
  const content = trimmed || labels.noDescription;
  const isFallback = !trimmed;

  return (
    <section className="pd-card pd-card-pad pd-admin-exercise-details-section pd-section-enter" aria-label={labels.description}>
      <h2 className="pd-section-title">{labels.description}</h2>
      <p className="pd-admin-exercise-details-text" dir={isFallback ? undefined : "auto"}>{content}</p>
    </section>
  );
}
