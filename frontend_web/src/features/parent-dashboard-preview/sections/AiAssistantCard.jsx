import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  { id: "explain", label: "Explain an exercise" },
  { id: "progress", label: "Understand progress" },
];

export function AiAssistantCard({ guidanceMessage, onAskAi, onSuggestionClick }) {
  const message = guidanceMessage?.trim()
    || "Ask about exercises, reports, sessions, or home-practice guidance.";

  return (
    <section className="pd-card pd-card-pad pd-ai-assistant-card pd-section-enter" aria-label="AI Assistant">
      <div className="pd-ai-assistant-head">
        <span className="pd-ai-assistant-icon" aria-hidden="true">
          <Sparkles size={20} strokeWidth={1.75} />
        </span>
        <div className="pd-ai-assistant-copy">
          <div className="pd-ai-assistant-title-row">
            <h2 className="pd-section-title">AI Assistant</h2>
            <span className="pd-ai-assistant-badge">Daily Guidance</span>
          </div>
          <p>{message}</p>
        </div>
      </div>

      <div className="pd-ai-assistant-suggestions" aria-label="Suggested topics">
        {SUGGESTIONS.map((suggestion) => (
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
        <Sparkles size={15} aria-hidden="true" />
        Ask AI
      </button>
    </section>
  );
}
