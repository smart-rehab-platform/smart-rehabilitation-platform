import { Activity, ChevronRight } from "lucide-react";

export function UpcomingExercisesCard({ exercises = [], onViewAll, onSelect }) {
  if (exercises.length === 0) {
    return (
      <section className="pd-upcoming-compact pd-section-enter">
        <div className="pd-card-header">
          <h2 className="pd-section-title">Upcoming Exercises</h2>
        </div>
        <p className="pd-empty pd-empty-inline">No upcoming exercises.</p>
      </section>
    );
  }

  const [primary, ...rest] = exercises;
  const compactRows = rest.slice(0, 2);
  const hiddenCount = Math.max(0, exercises.length - 1 - compactRows.length);

  return (
    <section className="pd-upcoming-compact pd-section-enter">
      <div className="pd-card-header">
        <h2 className="pd-section-title">Upcoming Exercises</h2>
        <button type="button" className="pd-link" onClick={onViewAll}>
          View All
        </button>
      </div>

      <button
        type="button"
        className="pd-upcoming-primary"
        onClick={() => onSelect?.(primary.title)}
      >
        <span className="pd-exercise-icon" aria-hidden="true">
          <Activity size={16} />
        </span>
        <span className="pd-upcoming-primary-copy">
          <strong title={primary.title}>{primary.title}</strong>
          <span>
            {[primary.whenLabel, primary.duration || primary.category].filter(Boolean).join(" · ")}
          </span>
        </span>
        <ChevronRight size={18} className="pd-upcoming-chevron" aria-hidden="true" />
      </button>

      {compactRows.length > 0 ? (
        <ul className="pd-upcoming-compact-list">
          {compactRows.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                className="pd-upcoming-compact-row"
                onClick={() => onSelect?.(exercise.title)}
              >
                <span className="pd-upcoming-compact-title">{exercise.title}</span>
                <span className="pd-upcoming-compact-meta">
                  {[exercise.whenLabel, exercise.duration].filter(Boolean).join(" · ")}
                </span>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {hiddenCount > 0 ? (
        <button type="button" className="pd-more-link" onClick={onViewAll}>
          +{hiddenCount} more
        </button>
      ) : null}
    </section>
  );
}
