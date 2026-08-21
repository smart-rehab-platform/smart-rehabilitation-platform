import { useLocale } from "../../../context/useLocale";
import {
  formatSpeechDateOnly,
  formatSpeechScoreDelta,
} from "../utils/specialistSpeechAnalysisMappers";
import {
  getSpecialistSpeechAnalysisLabels,
  getSpeechComparisonTrendLabel,
} from "../utils/specialistSpeechAnalysisLocalization";

function ComparisonRow({ label, delta }) {
  let tone = "neutral";
  if (delta != null && Number.isFinite(delta)) {
    if (delta < 0) {
      tone = "down";
    } else if (delta > 0) {
      tone = "up";
    }
  }

  return (
    <div className="pd-specialist-speech-comparison-row">
      <span>{label}</span>
      <span className={`pd-specialist-speech-delta pd-specialist-speech-delta-${tone}`}>
        {formatSpeechScoreDelta(delta)}
      </span>
    </div>
  );
}

export function SpecialistSpeechComparison({ comparison }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!comparison?.hasComparison) {
    return null;
  }

  const previousLabel = formatSpeechDateOnly(comparison.previousAnalyzedAt);

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-comparison-card">
      <div className="pd-specialist-speech-comparison-header">
        <h3 className="pd-specialist-speech-card-title">{labels.comparisonTitle}</h3>
        <span
          className={`pd-specialist-speech-trend-badge pd-specialist-speech-trend-${comparison.trendTone || "stable"}`}
        >
          {getSpeechComparisonTrendLabel(comparison.trend, t)}
        </span>
      </div>
      <div className="pd-specialist-speech-comparison-rows">
        <ComparisonRow label={labels.pronunciation} delta={comparison.pronunciationChange} />
        <ComparisonRow label={labels.fluency} delta={comparison.fluencyChange} />
        <ComparisonRow label={labels.overall} delta={comparison.overallScoreChange} />
      </div>
      {previousLabel ? (
        <p className="pd-specialist-speech-comparison-previous">
          {labels.previousLine.replace("{date}", previousLabel)}
        </p>
      ) : null}
    </section>
  );
}
