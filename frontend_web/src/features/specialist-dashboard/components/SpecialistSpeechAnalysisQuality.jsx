import { useLocale } from "../../../context/useLocale";
import {
  getSpecialistSpeechAnalysisLabels,
  getSpeechQualityStatusLabel,
} from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechAnalysisQuality({ analysisQuality }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!analysisQuality?.hasContent) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.analysisQuality}</h3>
      <div className="pd-specialist-speech-quality-block">
        <p className="pd-specialist-speech-quality-status">
          {getSpeechQualityStatusLabel(analysisQuality.status, t)}
        </p>
        {analysisQuality.confidence ? (
          <p className="pd-specialist-speech-meta-line">{analysisQuality.confidence}</p>
        ) : null}
        {analysisQuality.warnings?.length ? (
          <ul className="pd-specialist-speech-warning-list">
            {analysisQuality.warnings.map((warning) => (
              <li key={`${warning.code}-${warning.message}`}>{warning.message}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
