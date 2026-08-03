export function AiErrorState({ message, onRetry, retryLabel = "Retry" }) {
  return (
    <section className="pd-card pd-card-pad pd-ai-state pd-section-enter" role="alert">
      <p className="pd-inline-error">{message}</p>
      {onRetry ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </section>
  );
}
