export function AiEmptyState({ message, action = null }) {
  return (
    <section className="pd-card pd-card-pad pd-ai-empty pd-section-enter">
      <p className="pd-ai-empty-message">{message}</p>
      {action}
    </section>
  );
}
