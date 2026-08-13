import { formatSpeechScore } from "../utils/specialistSpeechAnalysisMappers";

export function SpecialistSpeechScoreCards({
  pronunciationScore,
  fluencyScore,
  overallScore,
}) {
  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-scores-card">
      <h3 className="pd-specialist-speech-card-title">Scores</h3>
      <div className="pd-specialist-speech-scores-grid">
        <div className="pd-specialist-speech-score-tile pd-specialist-speech-score-pronunciation">
          <p className="pd-specialist-speech-score-value">{formatSpeechScore(pronunciationScore)}</p>
          <p className="pd-specialist-speech-score-label">Pronunciation</p>
        </div>
        <div className="pd-specialist-speech-score-tile pd-specialist-speech-score-fluency">
          <p className="pd-specialist-speech-score-value">{formatSpeechScore(fluencyScore)}</p>
          <p className="pd-specialist-speech-score-label">Fluency</p>
        </div>
        <div className="pd-specialist-speech-score-tile pd-specialist-speech-score-overall">
          <p className="pd-specialist-speech-score-value">{formatSpeechScore(overallScore)}</p>
          <p className="pd-specialist-speech-score-label">Overall</p>
        </div>
      </div>
    </section>
  );
}
