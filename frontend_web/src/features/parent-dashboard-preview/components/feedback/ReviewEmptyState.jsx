export function ReviewEmptyState({ message }) {
  return (
    <section className="pd-card pd-card-pad pd-task-hub-empty pd-section-enter" aria-live="polite">
      <p className="pd-task-hub-empty-message">{message}</p>
    </section>
  );
}
