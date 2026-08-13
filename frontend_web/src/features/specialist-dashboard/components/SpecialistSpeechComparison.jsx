import {
  formatSpeechDateOnly,
  formatSpeechScoreDelta,
} from "../utils/specialistSpeechAnalysisMappers";

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
  if (!comparison?.hasComparison) {
    return null;
  }

  const previousLabel = formatSpeechDateOnly(comparison.previousAnalyzedAt);

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-comparison-card">
      <div className="pd-specialist-speech-comparison-header">
        <h3 className="pd-specialist-speech-card-title">Comparison with Previous</h3>
        <span
          className={`pd-specialist-speech-trend-badge pd-specialist-speech-trend-${comparison.trendTone || "stable"}`}
        >
          {comparison.trendLabel || "—"}
        </span>
      </div>
      <div className="pd-specialist-speech-comparison-rows">
        <ComparisonRow label="Pronunciation" delta={comparison.pronunciationChange} />
        <ComparisonRow label="Fluency" delta={comparison.fluencyChange} />
        <ComparisonRow label="Overall" delta={comparison.overallScoreChange} />
      </div>
      {previousLabel ? (
        <p className="pd-specialist-speech-comparison-previous">Previous: {previousLabel}</p>
      ) : null}
    </section>
  );
}
