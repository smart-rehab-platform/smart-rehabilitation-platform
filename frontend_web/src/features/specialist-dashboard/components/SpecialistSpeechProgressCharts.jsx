import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";
import { formatSpeechChartLabel } from "../utils/specialistSpeechAnalysisMappers";

export function SpecialistSpeechWordAccuracyChart({ historyPoints }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  const points = (historyPoints || []).filter(
    (point) => point.wordAccuracyPercentage != null,
  );

  if (points.length < 2) {
    return null;
  }

  const maxScore = Math.max(...points.map((item) => item.wordAccuracyPercentage ?? 0), 0);
  const scale = maxScore > 0 ? maxScore : 100;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-chart-card">
      <h3 className="pd-specialist-speech-card-title">{labels.wordAccuracyChartTitle}</h3>
      <div
        className="pd-specialist-speech-trend-chart pd-specialist-speech-word-accuracy-chart"
        role="img"
        aria-label={labels.wordAccuracyChartTitle}
      >
        {points.map((item) => {
          const score = item.wordAccuracyPercentage ?? 0;
          const heightFactor = Math.min(1, Math.max(0.08, score / scale));
          return (
            <div key={item.analysisId} className="pd-specialist-speech-trend-col">
              <div className="pd-specialist-speech-trend-bar-wrap">
                <div
                  className="pd-specialist-speech-trend-bar is-word-accuracy"
                  style={{ height: `${heightFactor * 100}%` }}
                  title={`${score}%`}
                />
              </div>
              <span className="pd-specialist-speech-trend-label">
                {formatSpeechChartLabel(item.analyzedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SpecialistSpeechAcousticDurationChart({ historyPoints }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  const points = (historyPoints || []).filter((point) => point.durationMs != null);

  if (points.length < 2) {
    return null;
  }

  const maxDuration = Math.max(...points.map((item) => item.durationMs ?? 0), 0);
  const scale = maxDuration > 0 ? maxDuration : 1;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-chart-card">
      <h3 className="pd-specialist-speech-card-title">{labels.acousticDurationChartTitle}</h3>
      <div
        className="pd-specialist-speech-trend-chart pd-specialist-speech-acoustic-chart"
        role="img"
        aria-label={labels.acousticDurationChartTitle}
      >
        {points.map((item) => {
          const duration = item.durationMs ?? 0;
          const heightFactor = Math.min(1, Math.max(0.08, duration / scale));
          return (
            <div key={item.analysisId} className="pd-specialist-speech-trend-col">
              <div className="pd-specialist-speech-trend-bar-wrap">
                <div
                  className="pd-specialist-speech-trend-bar is-acoustic-duration"
                  style={{ height: `${heightFactor * 100}%` }}
                  title={`${duration} ms`}
                />
              </div>
              <span className="pd-specialist-speech-trend-label">
                {formatSpeechChartLabel(item.analyzedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
