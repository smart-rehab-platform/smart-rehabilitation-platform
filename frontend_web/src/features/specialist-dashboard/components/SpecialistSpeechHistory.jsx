import { Check, ChevronRight } from "lucide-react";
import {
  formatSpeechDateTime,
  formatSpeechScore,
} from "../utils/specialistSpeechAnalysisMappers";

export function SpecialistSpeechHistory({ analyses, selectedId, onSelect }) {
  return (
    <section className="pd-specialist-speech-history">
      <h2 className="pd-specialist-speech-section-title">Analysis History</h2>
      {!analyses?.length ? (
        <div className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">No previous speech analyses recorded.</p>
        </div>
      ) : (
        <div className="pd-specialist-speech-history-list">
          {analyses.map((analysis) => {
            const selected = analysis.id === selectedId;
            const dateLabel = formatSpeechDateTime(analysis.analyzedAt) || "Unknown date";
            return (
              <button
                key={analysis.id}
                type="button"
                className={`pd-card pd-card-pad pd-specialist-speech-history-tile${selected ? " is-selected" : ""}`}
                onClick={() => onSelect(analysis.id)}
              >
                <div className="pd-specialist-speech-history-copy">
                  <p className="pd-specialist-speech-history-date">{dateLabel}</p>
                  <p className="pd-specialist-speech-history-scores">
                    Overall {formatSpeechScore(analysis.overallScore)} • Pronunciation{" "}
                    {formatSpeechScore(analysis.pronunciationScore)}
                  </p>
                </div>
                {selected ? (
                  <Check size={18} className="pd-specialist-speech-history-icon" aria-hidden="true" />
                ) : (
                  <ChevronRight size={18} className="pd-specialist-speech-history-icon" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
