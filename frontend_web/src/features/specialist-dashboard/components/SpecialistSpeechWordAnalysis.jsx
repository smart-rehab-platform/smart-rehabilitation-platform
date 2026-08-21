import { useLocale } from "../../../context/useLocale";
import {
  getSpecialistSpeechAnalysisLabels,
  getSpeechWordStatusLabel,
} from "../utils/specialistSpeechAnalysisLocalization";
import { formatSpeechScore } from "../utils/specialistSpeechAnalysisMappers";

function wordStatusTone(status) {
  switch ((status || "").toLowerCase()) {
    case "correct":
      return "is-correct";
    case "substitution":
      return "is-substitution";
    case "omission":
      return "is-omission";
    case "insertion":
      return "is-insertion";
    default:
      return "is-neutral";
  }
}

export function SpecialistSpeechWordAnalysis({ expectedSpeech, wordAnalysis, transcript }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!expectedSpeech?.hasContent || !wordAnalysis?.hasContent) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.wordAnalysis}</h3>
      <p className="pd-specialist-speech-word-accuracy">
        {labels.wordAccuracy}: {formatSpeechScore(wordAnalysis.wordAccuracyPercentage)}
      </p>
      <div className="pd-specialist-speech-word-chips">
        <span className="pd-specialist-speech-word-chip">
          {labels.wordCorrect}: {wordAnalysis.correctWords ?? "—"}
        </span>
        <span className="pd-specialist-speech-word-chip">
          {labels.wordSubstitutions}: {wordAnalysis.substitutions ?? "—"}
        </span>
        <span className="pd-specialist-speech-word-chip">
          {labels.wordOmissions}: {wordAnalysis.omissions ?? "—"}
        </span>
        <span className="pd-specialist-speech-word-chip">
          {labels.wordInsertions}: {wordAnalysis.insertions ?? "—"}
        </span>
      </div>
      {wordAnalysis.alignedWords?.length ? (
        <>
          <p className="pd-specialist-speech-subheading">{labels.alignedWords}</p>
          <div className="pd-specialist-speech-aligned-list">
            {wordAnalysis.alignedWords.map((word, index) => (
              <div
                key={`${word.expected}-${word.detected}-${index}`}
                className={`pd-specialist-speech-aligned-row ${wordStatusTone(word.status)}`}
              >
                <span className="pd-specialist-speech-aligned-status">
                  {getSpeechWordStatusLabel(word.status, t)}
                </span>
                <span className="pd-specialist-speech-aligned-copy" dir="auto">
                  {word.expected || "—"} → {word.detected || "—"}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      {transcript ? (
        <p className="pd-specialist-speech-meta-line pd-specialist-speech-transcript-ref" dir="auto">
          {transcript}
        </p>
      ) : null}
    </section>
  );
}
