import { useLocale } from "../../../context/useLocale";
import {
  getSpecialistSpeechAnalysisLabels,
  getSpeechTrendDisplayLabel,
} from "../utils/specialistSpeechAnalysisLocalization";
import { formatSpeechScore } from "../utils/specialistSpeechAnalysisMappers";

function MetricTrendRow({ label, trend }) {
  if (!trend?.hasContent) {
    return null;
  }
  return (
    <div className="pd-specialist-speech-metric-row">
      <span>{label}</span>
      <strong>
        {formatSpeechScore(trend.first)} → {formatSpeechScore(trend.latest)}
        {trend.change != null ? ` (${trend.change > 0 ? "+" : ""}${trend.change})` : ""}
      </strong>
    </div>
  );
}

export function SpecialistSpeechProgressInsights({ insights, isLoading, error, onRetry }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (isLoading) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
        <h3 className="pd-specialist-speech-card-title">{labels.progressInsightsTitle}</h3>
        <p className="pd-inline-loading">{labels.progressLoading}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
        <h3 className="pd-specialist-speech-card-title">{labels.progressInsightsTitle}</h3>
        <p className="pd-inline-error">{error}</p>
        {onRetry ? (
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            {labels.retry}
          </button>
        ) : null}
      </section>
    );
  }

  if (!insights?.hasContent) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
        <h3 className="pd-specialist-speech-card-title">{labels.progressInsightsTitle}</h3>
        <p className="pd-section-sub">{labels.insufficientHistory}</p>
      </section>
    );
  }

  const wordTrend = insights.wordAccuracyTrend;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.progressInsightsTitle}</h3>
      {wordTrend?.hasContent ? (
        <div className="pd-specialist-speech-insight-block">
          <p className="pd-specialist-speech-subheading">{labels.wordAccuracy}</p>
          <p className="pd-specialist-speech-meta-line">
            {formatSpeechScore(wordTrend.firstAccuracy)} → {formatSpeechScore(wordTrend.latestAccuracy)}
            {wordTrend.changePercentagePoints != null
              ? ` (${wordTrend.changePercentagePoints > 0 ? "+" : ""}${wordTrend.changePercentagePoints} pts)`
              : ""}
          </p>
          <p className="pd-specialist-speech-trend-badge">
            {getSpeechTrendDisplayLabel(wordTrend.trend, t)}
          </p>
        </div>
      ) : null}
      {insights.repeatedWordDifficulties?.length ? (
        <>
          <p className="pd-specialist-speech-subheading">{labels.repeatedDifficulties}</p>
          <ul className="pd-specialist-speech-insight-list">
            {insights.repeatedWordDifficulties.map((item) => (
              <li key={item.expectedWord}>
                <strong dir="auto">{item.expectedWord}</strong>
                {" — "}
                {formatSpeechScore(item.accuracyPercentage)}%
                {item.timesIncorrect != null ? ` • ${item.timesIncorrect} incorrect` : ""}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {insights.repeatedWordSubstitutions?.length ? (
        <>
          <p className="pd-specialist-speech-subheading">{labels.repeatedSubstitutions}</p>
          <ul className="pd-specialist-speech-insight-list">
            {insights.repeatedWordSubstitutions.map((item) => (
              <li key={`${item.expectedWord}-${item.detectedWord}`}>
                <span dir="auto">{item.expectedWord}</span> → <span dir="auto">{item.detectedWord}</span>
                {" "}
                {labels.detectedCount.replace("{count}", String(item.count ?? 0))}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {insights.fluencyTrend?.hasContent ? (
        <>
          <p className="pd-specialist-speech-subheading">{labels.fluencyTrends}</p>
          <MetricTrendRow label={labels.speakingRate} trend={insights.fluencyTrend.wordsPerMinute} />
          <MetricTrendRow label={labels.pauseRatio} trend={insights.fluencyTrend.pauseRatioPercentage} />
          <MetricTrendRow label={labels.pauses} trend={insights.fluencyTrend.pauseCount} />
        </>
      ) : null}
    </section>
  );
}
