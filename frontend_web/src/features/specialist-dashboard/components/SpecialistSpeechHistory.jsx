import { Check, ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import {
  formatSpeechAnalysisDateTime,
  getSpecialistSpeechAnalysisLabels,
  getSpeechHistorySummaryLabel,
} from "../utils/specialistSpeechAnalysisLocalization";

export function SpecialistSpeechHistory({ analyses, selectedId, onSelect }) {
  const { t, locale } = useLocale();
  const labels = getSpecialistSpeechAnalysisLabels(t);

  return (
    <section className="pd-specialist-speech-history">
      <h2 className="pd-specialist-speech-section-title">{labels.historyTitle}</h2>
      {!analyses?.length ? (
        <div className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{labels.emptyHistory}</p>
        </div>
      ) : (
        <div className="pd-specialist-speech-history-list">
          {analyses.map((analysis) => {
            const selected = analysis.id === selectedId;
            const dateLabel = formatSpeechAnalysisDateTime(analysis.analyzedAt, locale, t);
            const summaryLabel = getSpeechHistorySummaryLabel(analysis, t);
            return (
              <button
                key={analysis.id}
                type="button"
                className={`pd-card pd-card-pad pd-specialist-speech-history-tile${selected ? " is-selected" : ""}`}
                onClick={() => onSelect(analysis.id)}
              >
                <div className="pd-specialist-speech-history-copy">
                  <p className="pd-specialist-speech-history-date">{dateLabel}</p>
                  <p className="pd-specialist-speech-history-scores">{summaryLabel}</p>
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
