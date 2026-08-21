import { useLocale } from "../../../context/useLocale";
import { formatSpeechScore } from "../utils/specialistSpeechAnalysisMappers";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechScoreCards({
  pronunciationScore,
  fluencyScore,
  overallScore,
}) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-scores-card">
      <h3 className="pd-specialist-speech-card-title">{labels.scoresTitle}</h3>
      <div className="pd-specialist-speech-scores-grid">
        <div className="pd-specialist-speech-score-tile pd-specialist-speech-score-overall">
          <p className="pd-specialist-speech-score-value">{formatSpeechScore(overallScore)}</p>
          <p className="pd-specialist-speech-score-label">{labels.overall}</p>
        </div>
        <div className="pd-specialist-speech-score-tile pd-specialist-speech-score-pronunciation">
          <p className="pd-specialist-speech-score-value">{formatSpeechScore(pronunciationScore)}</p>
          <p className="pd-specialist-speech-score-label">{labels.pronunciation}</p>
        </div>
        <div className="pd-specialist-speech-score-tile pd-specialist-speech-score-fluency">
          <p className="pd-specialist-speech-score-value">{formatSpeechScore(fluencyScore)}</p>
          <p className="pd-specialist-speech-score-label">{labels.fluency}</p>
        </div>
      </div>
    </section>
  );
}
