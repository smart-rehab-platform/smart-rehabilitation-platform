import { CheckCircle2 } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

const CARDS = [
  {
    key: "exercises",
    icon: "activity",
    tone: "blue",
    valueKey: "todaysExercises",
    label: "Today's Exercises",
    detail: (s) => `${s.remaining} remaining`,
  },
  {
    key: "completed",
    icon: null,
    lucide: CheckCircle2,
    tone: "green",
    valueKey: "completed",
    label: "Completed",
    detail: (s) => `${s.completionPercent}% of today's tasks`,
  },
  {
    key: "session",
    icon: "calendarDays",
    tone: "orange",
    valueKey: "nextSessionLabel",
    label: "Next Session",
    detail: (s) => s.nextSessionDetail,
  },
  {
    key: "feedback",
    icon: "message",
    tone: "red",
    valueKey: "newFeedback",
    label: "New Feedback",
    detail: (s) => s.newFeedbackDetail,
  },
];

export function SummaryCardsRow({ summary }) {
  return (
    <section className="pd-summary-row" aria-label="Today summary">
      {CARDS.map((card) => (
        <article key={card.key} className="pd-card pd-summary-card">
          <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
            {card.icon ? (
              <PlatformMaterialIcon icon={card.icon} size={18} />
            ) : (
              <card.lucide size={18} />
            )}
          </span>
          <strong className="pd-summary-value">{summary[card.valueKey]}</strong>
          <span className="pd-summary-label">{card.label}</span>
          <span className="pd-summary-detail">{card.detail(summary)}</span>
        </article>
      ))}
    </section>
  );
}
