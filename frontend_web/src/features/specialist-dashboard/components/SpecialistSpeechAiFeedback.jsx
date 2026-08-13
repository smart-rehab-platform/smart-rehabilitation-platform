function FeedbackSection({ title, children }) {
  if (!children) {
    return null;
  }
  return (
    <div className="pd-specialist-speech-feedback-section">
      <h4 className="pd-specialist-speech-feedback-section-title">{title}</h4>
      {children}
    </div>
  );
}

export function SpecialistSpeechAiFeedback({ feedback }) {
  if (!feedback?.hasContent) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-feedback-card">
      <h3 className="pd-specialist-speech-card-title">AI Feedback &amp; Recommendations</h3>

      <FeedbackSection title="Improvement Summary">
        {feedback.improvementSummary ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.improvementSummary}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title="Clinical Note">
        {feedback.clinicalNote ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.clinicalNote}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title="Recommended Action">
        {feedback.recommendedAction ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.recommendedAction}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title="Recommendations">
        {feedback.recommendations?.length ? (
          <ul className="pd-specialist-speech-feedback-list">
            {feedback.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title="Treatment Analysis">
        {feedback.treatmentAnalysis ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.treatmentAnalysis}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title="Decision Support">
        {feedback.suggestedAction || feedback.decisionSupportReason ? (
          <div className="pd-specialist-speech-feedback-text">
            {feedback.suggestedAction ? (
              <p>
                <strong>Suggested:</strong> {feedback.suggestedAction}
              </p>
            ) : null}
            {feedback.decisionSupportReason ? <p>{feedback.decisionSupportReason}</p> : null}
          </div>
        ) : null}
      </FeedbackSection>
    </section>
  );
}
