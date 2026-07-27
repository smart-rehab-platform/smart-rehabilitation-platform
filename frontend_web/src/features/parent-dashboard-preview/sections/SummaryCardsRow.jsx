import { Activity, CalendarDays, CheckCircle2, MessageCircle } from "lucide-react";

const CARDS = [
  {
    key: "exercises",
    icon: Activity,
    tone: "blue",
    valueKey: "todaysExercises",
    label: "Today's Exercises",
    detail: (s) => `${s.remaining} remaining`,
  },
  {
    key: "completed",
    icon: CheckCircle2,
    tone: "green",
    valueKey: "completed",
    label: "Completed",
    detail: (s) => `${s.completionPercent}% of today's tasks`,
  },
  {
    key: "session",
    icon: CalendarDays,
    tone: "orange",
    valueKey: "nextSessionLabel",
    label: "Next Session",
    detail: (s) => s.nextSessionDetail,
  },
  {
    key: "feedback",
    icon: MessageCircle,
    tone: "red",
    valueKey: "newFeedback",
    label: "New Feedback",
    detail: (s) => s.newFeedbackDetail,
  },
];

export function SummaryCardsRow({ summary }) {
  return (
    <section className="pd-summary-row" aria-label="Today summary">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="pd-card pd-summary-card">
            <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
              <Icon size={18} />
            </span>
            <strong className="pd-summary-value">{summary[card.valueKey]}</strong>
            <span className="pd-summary-label">{card.label}</span>
            <span className="pd-summary-detail">{card.detail(summary)}</span>
          </article>
        );
      })}
    </section>
  );
}
