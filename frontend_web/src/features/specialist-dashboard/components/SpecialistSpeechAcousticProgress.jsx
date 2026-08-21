import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";
import { formatSpeechAnalysisDateTime } from "../utils/specialistSpeechAnalysisLocalization";

function formatNumber(value, digits = 1) {
  if (value == null || !Number.isFinite(value)) {
    return "—";
  }
  return value === Math.round(value) ? String(Math.round(value)) : value.toFixed(digits);
}

function TrendBlock({ label, trend }) {
  if (!trend?.hasContent) {
    return null;
  }
  return (
    <div className="pd-specialist-speech-metric-row">
      <span>{label}</span>
      <strong>
        {formatNumber(trend.first)} → {formatNumber(trend.latest)}
        {trend.change != null ? ` (${trend.change > 0 ? "+" : ""}${formatNumber(trend.change)})` : ""}
      </strong>
    </div>
  );
}

export function SpecialistSpeechAcousticProgress({ acousticProgress }) {
  const { t, locale } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!acousticProgress?.hasContent) {
    return null;
  }

  const targetLabel =
    acousticProgress.targetPhone?.display ||
    acousticProgress.targetPhone?.requested ||
    acousticProgress.targetPhone?.ipa ||
    null;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.acousticProgressTitle}</h3>
      {targetLabel ? (
        <p className="pd-specialist-speech-meta-line">
          {labels.targetPhoneme}: <span dir="auto">{targetLabel}</span>
        </p>
      ) : null}
      <TrendBlock label={labels.durationMs} trend={acousticProgress.durationTrend} />
      <TrendBlock label={labels.meanF0} trend={acousticProgress.f0Trend} />
      <TrendBlock label={labels.meanIntensity} trend={acousticProgress.intensityTrend} />
      {acousticProgress.previousComparableAnalysis?.hasContent ? (
        <div className="pd-specialist-speech-insight-block">
          <p className="pd-specialist-speech-subheading">{labels.previousAttempt}</p>
          <p className="pd-specialist-speech-meta-line">
            {formatSpeechAnalysisDateTime(
              acousticProgress.previousComparableAnalysis.analyzedAt,
              locale,
              t,
            )}
          </p>
          <p className="pd-specialist-speech-meta-line">
            {labels.durationMs}: {formatNumber(acousticProgress.previousComparableAnalysis.durationMs, 0)} ms
          </p>
        </div>
      ) : null}
    </section>
  );
}
