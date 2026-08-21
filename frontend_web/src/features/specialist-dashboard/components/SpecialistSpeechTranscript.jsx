import { useLocale } from "../../../context/useLocale";
import { isArabicLanguage } from "../utils/specialistSpeechAnalysisMappers";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechTranscript({ transcript, language, durationSeconds }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);
  const metaParts = [];
  if (language) {
    metaParts.push(labels.languageLine.replace("{language}", language));
  }
  if (durationSeconds != null && Number.isFinite(durationSeconds)) {
    metaParts.push(
      labels.durationLine.replace("{seconds}", durationSeconds.toFixed(1)),
    );
  }

  const text = transcript?.trim() ? transcript : labels.noTranscript;
  const dir = isArabicLanguage(language) ? "rtl" : "auto";

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-transcript-card">
      <h3 className="pd-specialist-speech-card-title">{labels.transcriptTitle}</h3>
      {metaParts.length ? (
        <p className="pd-specialist-speech-transcript-meta">{metaParts.join(" • ")}</p>
      ) : null}
      <p className="pd-specialist-speech-transcript-text" dir={dir}>
        {text}
      </p>
    </section>
  );
}
