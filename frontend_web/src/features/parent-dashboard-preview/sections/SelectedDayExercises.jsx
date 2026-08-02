import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { exerciseStatusMeta, MONTH_NAMES } from "../mock/parentDashboardMock";
import { StatusBadge } from "../components/StatusBadge";

function actionForStatus(status) {
  switch (status) {
    case "todo":
      return "Start";
    case "submitted":
      return "View";
    case "reviewed":
      return "View";
    default:
      return "Open";
  }
}

export function SelectedDayExercises({
  monthIndex,
  selectedDay,
  isToday = false,
  exercises = [],
  onExerciseAction,
  onViewAll,
}) {
  const monthName = MONTH_NAMES[monthIndex] || "Month";
  const heading = isToday
    ? "Today's Exercises"
    : `Exercises for ${monthName} ${selectedDay}`;

  const visible = exercises.slice(0, 3);

  return (
    <section className="pd-card pd-card-pad pd-selected-day">
      <div className="pd-card-header">
        <h2 className="pd-section-title">{heading}</h2>
        <button type="button" className="pd-link" onClick={onViewAll}>
          View All Exercises
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="pd-empty pd-empty-inline">No exercises scheduled for this day.</p>
      ) : (
        <ul className="pd-day-exercise-list">
          {visible.map((exercise) => {
            const meta = exerciseStatusMeta[exercise.status] || {
              label: exercise.status,
              tone: "gray",
            };
            const action = actionForStatus(exercise.status);

            return (
              <li key={exercise.id} className="pd-day-exercise-item">
                <span className="pd-exercise-icon" aria-hidden="true">
                  <PlatformMaterialIcon icon="activity" size={14} />
                </span>
                <div className="pd-exercise-copy">
                  <strong>{exercise.title}</strong>
                  <span>{exercise.duration}</span>
                </div>
                <StatusBadge label={meta.label} tone={meta.tone} />
                <button
                  type="button"
                  className="pd-link"
                  onClick={() => onExerciseAction?.(exercise.title, action)}
                >
                  {action}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
