import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

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
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!feedback?.hasContent) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-feedback-card">
      <h3 className="pd-specialist-speech-card-title">{labels.aiFeedbackTitle}</h3>

      <FeedbackSection title={labels.improvementSummary}>
        {feedback.improvementSummary ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.improvementSummary}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title={labels.clinicalNote}>
        {feedback.clinicalNote ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.clinicalNote}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title={labels.recommendedAction}>
        {feedback.recommendedAction ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.recommendedAction}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title={labels.recommendations}>
        {feedback.recommendations?.length ? (
          <ul className="pd-specialist-speech-feedback-list">
            {feedback.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title={labels.treatmentAnalysis}>
        {feedback.treatmentAnalysis ? (
          <p className="pd-specialist-speech-feedback-text">{feedback.treatmentAnalysis}</p>
        ) : null}
      </FeedbackSection>

      <FeedbackSection title={labels.decisionSupport}>
        {feedback.suggestedAction || feedback.decisionSupportReason ? (
          <div className="pd-specialist-speech-feedback-text">
            {feedback.suggestedAction ? (
              <p>{labels.suggestedLine.replace("{action}", feedback.suggestedAction)}</p>
            ) : null}
            {feedback.decisionSupportReason ? <p>{feedback.decisionSupportReason}</p> : null}
          </div>
        ) : null}
      </FeedbackSection>
    </section>
  );
}
