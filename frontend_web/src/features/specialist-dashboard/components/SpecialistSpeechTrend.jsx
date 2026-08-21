import { useLocale } from "../../../context/useLocale";
import { formatSpeechChartLabel } from "../utils/specialistSpeechAnalysisMappers";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechTrend({ progressItems }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!Array.isArray(progressItems) || progressItems.length < 2) {
    return null;
  }

  const maxScore = Math.max(
    ...progressItems.map((item) => item.overallScore ?? 0),
    0,
  );
  const scale = maxScore > 0 ? maxScore : 1;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-trend-card">
      <h3 className="pd-specialist-speech-card-title">{labels.overallTrendTitle}</h3>
      <div
        className="pd-specialist-speech-trend-chart"
        role="img"
        aria-label={labels.overallTrendTitle}
      >
        {progressItems.map((item) => {
          const score = item.overallScore ?? 0;
          const heightFactor = Math.min(1, Math.max(0.08, score / scale));
          return (
            <div key={item.id} className="pd-specialist-speech-trend-col">
              <div className="pd-specialist-speech-trend-bar-wrap">
                <div
                  className="pd-specialist-speech-trend-bar is-overall"
                  style={{ height: `${heightFactor * 100}%` }}
                  title={String(score)}
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
