export function SuggestedHomePracticeCard({ practice }) {
  if (!practice?.body) {
    return null;
  }

  return (
    <section className="pd-ai-suggested-practice" aria-label="Suggested home practice">
      <h3 className="pd-ai-suggested-practice-title">
        {practice.title || "Suggested Home Practice"}
      </h3>
      <p className="pd-ai-suggested-practice-body">{practice.body}</p>
    </section>
  );
}
