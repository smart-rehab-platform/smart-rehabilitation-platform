import { LoaderCircle } from "lucide-react";

export function SpecialistSpeechAnalyzeCard({ isAnalyzing, onAnalyze }) {
  return (
    <section className="pd-card pd-card-pad pd-specialist-speech-analyze-card">
      <h2 className="pd-specialist-speech-section-title">Run Speech Analysis</h2>
      <p className="pd-specialist-speech-section-sub">
        Analyze the audio from this exercise submission using speech recognition.
      </p>
      <button
        type="button"
        className="pd-btn pd-btn-primary pd-specialist-speech-analyze-btn"
        onClick={onAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <LoaderCircle size={16} className="pd-specialist-speech-spin" aria-hidden="true" />
            Analyzing...
          </>
        ) : (
          "Analyze Submission"
        )}
      </button>
    </section>
  );
}
