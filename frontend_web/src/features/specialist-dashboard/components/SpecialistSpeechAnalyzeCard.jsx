import { LoaderCircle } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { getSpecialistSpeechAnalysisLabels } from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechAnalyzeCard({ isAnalyzing, onAnalyze }) {
  const { t } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-analyze-card">
      <h2 className="pd-specialist-speech-section-title">{labels.runTitle}</h2>
      <p className="pd-specialist-speech-section-sub">{labels.runSubtitle}</p>
      <button
        type="button"
        className="pd-btn pd-btn-primary pd-specialist-speech-analyze-btn"
        onClick={onAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <LoaderCircle size={16} className="pd-specialist-speech-spin" aria-hidden="true" />
            {labels.analyzing}
          </>
        ) : (
          labels.analyzeSubmission
        )}
      </button>
    </section>
  );
}
