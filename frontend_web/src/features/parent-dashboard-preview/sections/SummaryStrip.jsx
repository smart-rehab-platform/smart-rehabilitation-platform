import { Activity, CalendarDays, TrendingUp } from "lucide-react";

const SEGMENTS = [
  {
    key: "tasks",
    icon: Activity,
    tone: "blue",
    label: "Today's Tasks",
    value: (s) => String(s.todaysExercises ?? 0),
    actionLabel: "Exercises",
  },
  {
    key: "session",
    icon: CalendarDays,
    tone: "orange",
    label: "Next Session",
    value: (s) => s.nextSessionLabel || "—",
    actionLabel: "Sessions",
  },
  {
    key: "progress",
    icon: TrendingUp,
    tone: "green",
    label: "Overall Progress",
    value: (s) => s.overallProgress || "—",
    actionLabel: "Progress",
  },
];

export function SummaryStrip({ summary, onNavigate }) {
  return (
    <section className="pd-quick-summary pd-section-enter" aria-label="Quick summary">
      {SEGMENTS.map((segment) => {
        const Icon = segment.icon;
        return (
          <button
            key={segment.key}
            type="button"
            className={`pd-quick-summary-item pd-quick-summary-item--${segment.key}`}
            onClick={() => onNavigate?.(segment.actionLabel)}
            aria-label={`${segment.label}: ${segment.value(summary)}. Go to ${segment.actionLabel}.`}
          >
            <span className={`pd-summary-icon pd-tone-${segment.tone}`} aria-hidden="true">
              <Icon size={15} />
            </span>
            <span className="pd-quick-summary-copy">
              <span className="pd-summary-label">{segment.label}</span>
              <strong className="pd-summary-value">{segment.value(summary)}</strong>
            </span>
          </button>
        );
      })}
    </section>
  );
}
