import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

function formatNumber(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return value === Math.round(value) ? String(Math.round(value)) : value.toFixed(digits);
}

export function SpecialistSpeechPhonemeAnalysis({ phonemeAnalysis }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!phonemeAnalysis?.hasContent) {
    return null;
  }

  const targetLabel =
    phonemeAnalysis.targetPhone?.display ||
    phonemeAnalysis.targetPhone?.requested ||
    phonemeAnalysis.targetPhone?.ipa ||
    null;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.phonemeTitle}</h3>
      {targetLabel ? (
        <p className="pd-specialist-speech-meta-line">
          {labels.targetPhoneme}: <span dir="auto">{targetLabel}</span>
        </p>
      ) : null}
      {phonemeAnalysis.expectedText ? (
        <p className="pd-specialist-speech-meta-line" dir="auto">
          {phonemeAnalysis.expectedText}
        </p>
      ) : null}
      {phonemeAnalysis.targetOccurrences?.length ? (
        <>
          <p className="pd-specialist-speech-subheading">{labels.alignedOccurrences}</p>
          <div className="pd-specialist-speech-occurrence-list">
            {phonemeAnalysis.targetOccurrences.map((occurrence, index) => (
              <div key={`${occurrence.word}-${occurrence.phoneIndex}-${index}`} className="pd-specialist-speech-occurrence-row">
                <p className="pd-specialist-speech-occurrence-title" dir="auto">
                  {occurrence.word || "—"} • {occurrence.phone || "—"}
                </p>
                {occurrence.acousticMeasurements?.hasAnyMeasurement ? (
                  <div className="pd-specialist-speech-acoustic-grid">
                    <span>
                      {labels.durationMs}: {formatNumber(occurrence.acousticMeasurements.durationMs, 0)} ms
                    </span>
                    <span>
                      {labels.meanF0}: {formatNumber(occurrence.acousticMeasurements.meanF0Hz, 0)} Hz
                    </span>
                    <span>
                      {labels.meanIntensity}: {formatNumber(occurrence.acousticMeasurements.meanIntensityDb)} dB
                    </span>
                    {occurrence.acousticMeasurements.meanF1Hz != null ? (
                      <span>
                        {labels.meanF1}: {formatNumber(occurrence.acousticMeasurements.meanF1Hz, 0)} Hz
                      </span>
                    ) : null}
                    {occurrence.acousticMeasurements.meanF2Hz != null ? (
                      <span>
                        {labels.meanF2}: {formatNumber(occurrence.acousticMeasurements.meanF2Hz, 0)} Hz
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
