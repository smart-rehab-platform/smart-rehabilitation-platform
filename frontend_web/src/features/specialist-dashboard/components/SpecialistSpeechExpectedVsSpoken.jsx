import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";
import { isArabicLanguage } from "../utils/specialistSpeechAnalysisMappers";

export function SpecialistSpeechExpectedVsSpoken({
  expectedSpeech,
  transcript,
}) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!expectedSpeech?.hasContent) {
    return null;
  }

  const expectedText = expectedSpeech.expectedText?.trim() || "—";
  const spokenText = transcript?.trim() || "—";

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-section-card">
      <h3 className="pd-specialist-speech-card-title">{labels.expectedVsSpoken}</h3>
      <div className="pd-specialist-speech-expected-grid">
        <div className="pd-specialist-speech-expected-block">
          <p className="pd-specialist-speech-field-label">{labels.expected}</p>
          <p className="pd-specialist-speech-field-value" dir="auto">{expectedText}</p>
        </div>
        <div className="pd-specialist-speech-expected-block">
          <p className="pd-specialist-speech-field-label">{labels.spoken}</p>
          <p
            className="pd-specialist-speech-field-value"
            dir={isArabicLanguage(transcript) ? "rtl" : "auto"}
          >
            {spokenText}
          </p>
        </div>
      </div>
      {expectedSpeech.targetWord ? (
        <p className="pd-specialist-speech-meta-line">
          <span className="pd-specialist-speech-field-label">{labels.targetWord}: </span>
          <span dir="auto">{expectedSpeech.targetWord}</span>
        </p>
      ) : null}
      {expectedSpeech.targetPhoneme ? (
        <p className="pd-specialist-speech-meta-line">
          <span className="pd-specialist-speech-field-label">{labels.targetPhoneme}: </span>
          <span dir="auto">{expectedSpeech.targetPhoneme}</span>
        </p>
      ) : null}
    </section>
  );
}

export function SpecialistSpeechAudioPlayer({ audioFileUrl }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  if (!audioFileUrl) {
    return null;
  }

  const resolvedUrl = resolveUploadedAssetUrl(audioFileUrl) ?? audioFileUrl;

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-audio-card">
      <h3 className="pd-specialist-speech-card-title">{labels.audioPlayback}</h3>
      <audio className="pd-specialist-speech-audio-player" controls preload="metadata" src={resolvedUrl}>
        <track kind="captions" />
      </audio>
    </section>
  );
}
