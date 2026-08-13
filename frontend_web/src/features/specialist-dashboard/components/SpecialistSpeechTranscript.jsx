import { isArabicLanguage } from "../utils/specialistSpeechAnalysisMappers";

export function SpecialistSpeechTranscript({ transcript, language, durationSeconds }) {
  const metaParts = [];
  if (language) {
    metaParts.push(`Language: ${language}`);
  }
  if (durationSeconds != null && Number.isFinite(durationSeconds)) {
    metaParts.push(`Duration: ${durationSeconds.toFixed(1)}s`);
  }

  const text = transcript?.trim()
    ? transcript
    : "No transcript available for this analysis.";
  const dir = isArabicLanguage(language) ? "rtl" : "auto";

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-transcript-card">
      <h3 className="pd-specialist-speech-card-title">Transcript</h3>
      {metaParts.length ? (
        <p className="pd-specialist-speech-transcript-meta">{metaParts.join(" • ")}</p>
      ) : null}
      <p className="pd-specialist-speech-transcript-text" dir={dir}>
        {text}
      </p>
    </section>
  );
}
