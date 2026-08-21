import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";
import { formatSpeechScore } from "../utils/specialistSpeechAnalysisMappers";

function formatMetricValue(value, suffix = "") {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  const formatted = value === Math.round(value) ? String(Math.round(value)) : value.toFixed(1);
  return suffix ? `${formatted}${suffix}` : formatted;
}

export function SpecialistSpeechTimingMetrics({ fluencyMetrics, asrConfidence }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!fluencyMetrics?.hasContent) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.timingTitle}</h3>
      <p className="pd-specialist-speech-section-sub">{labels.timingSubtitle}</p>
      <div className="pd-specialist-speech-metrics-grid">
        <div className="pd-specialist-speech-metric-row">
          <span>{labels.speakingRate}</span>
          <strong>
            {fluencyMetrics.wordsPerMinute != null
              ? labels.wordsPerMinute.replace(
                  "{value}",
                  formatMetricValue(fluencyMetrics.wordsPerMinute),
                )
              : "—"}
          </strong>
        </div>
        <div className="pd-specialist-speech-metric-row">
          <span>{labels.speechDuration}</span>
          <strong>
            {fluencyMetrics.speechDurationSeconds != null
              ? labels.secondsValue.replace(
                  "{value}",
                  formatMetricValue(fluencyMetrics.speechDurationSeconds),
                )
              : "—"}
          </strong>
        </div>
        <div className="pd-specialist-speech-metric-row">
          <span>{labels.pauses}</span>
          <strong>{fluencyMetrics.pauseCount ?? "—"}</strong>
        </div>
        <div className="pd-specialist-speech-metric-row">
          <span>{labels.totalPauseTime}</span>
          <strong>
            {fluencyMetrics.totalPauseDurationSeconds != null
              ? labels.secondsValue.replace(
                  "{value}",
                  formatMetricValue(fluencyMetrics.totalPauseDurationSeconds, ""),
                )
              : "—"}
          </strong>
        </div>
        <div className="pd-specialist-speech-metric-row">
          <span>{labels.longestPause}</span>
          <strong>
            {fluencyMetrics.longestPauseSeconds != null
              ? labels.secondsValue.replace(
                  "{value}",
                  formatMetricValue(fluencyMetrics.longestPauseSeconds, ""),
                )
              : "—"}
          </strong>
        </div>
        <div className="pd-specialist-speech-metric-row">
          <span>{labels.pauseRatio}</span>
          <strong>
            {fluencyMetrics.pauseRatioPercentage != null
              ? `${formatMetricValue(fluencyMetrics.pauseRatioPercentage)}%`
              : "—"}
          </strong>
        </div>
      </div>
      {asrConfidence?.hasContent ? (
        <div className="pd-specialist-speech-asr-block">
          <p className="pd-specialist-speech-subheading">{labels.asrConfidence}</p>
          <p className="pd-specialist-speech-meta-line">
            {labels.averageWordProbability}:{" "}
            {formatSpeechScore(asrConfidence.averageWordProbability)}
          </p>
        </div>
      ) : null}
    </section>
  );
}
