import { useMemo } from "react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";

export function AiAssistantCard({ guidanceMessage, onAskAi, onSuggestionClick }) {
  const { t } = useLocale();

  const suggestions = useMemo(() => ([
    { id: "explain", label: t("parent.home.aiSuggestionExplainExercise") },
    { id: "progress", label: t("parent.home.aiSuggestionUnderstandProgress") },
  ]), [t]);

  const message = guidanceMessage?.trim() || t("parent.home.aiAssistantHint");

  return (
    <section className="pd-card pd-card-pad pd-ai-assistant-card pd-section-enter" aria-label={t("parent.home.aiAssistantCard")}>
      <div className="pd-ai-assistant-head">
        <span className="pd-ai-assistant-icon" aria-hidden="true">
          <PlatformMaterialIcon icon="ai" size={20} />
        </span>
        <div className="pd-ai-assistant-copy">
          <div className="pd-ai-assistant-title-row">
            <h2 className="pd-section-title">{t("parent.home.aiAssistantCard")}</h2>
            <span className="pd-ai-assistant-badge">{t("parent.home.aiDailyGuidance")}</span>
          </div>
          <p>{message}</p>
        </div>
      </div>

      <div className="pd-ai-assistant-suggestions" aria-label={t("parent.home.suggestedTopicsAriaLabel")}>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            type="button"
            className="pd-ai-assistant-chip"
            onClick={() => onSuggestionClick?.(suggestion.id) ?? onAskAi?.()}
          >
            {suggestion.label}
          </button>
        ))}
      </div>

      <button type="button" className="pd-btn pd-btn-primary pd-ai-assistant-btn" onClick={onAskAi}>
        <PlatformMaterialIcon icon="ai" size={15} />
        {t("parent.home.askAi")}
      </button>
    </section>
  );
}
