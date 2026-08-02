import { useMemo } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { exerciseStatusMeta } from "../mock/parentDashboardMock";
import { StatusBadge } from "../components/StatusBadge";
import { getDashboardPriorityTasks } from "../utils/parentDashboardMappers";

const TASK_COLORS = ["blue", "teal", "purple", "orange"];

function taskIconDescriptor() {
  return { type: "platform", key: "activity" };
}

function isCompletedStatus(status) {
  return status === "submitted" || status === "reviewed";
}

function resolveTodayTasks(exercises) {
  const todayTasks = exercises.filter(
    (exercise) => !exercise.due || exercise.due.toLowerCase().includes("today"),
  );
  return todayTasks.length > 0 ? todayTasks : exercises;
}

export function TodaysExercisesSection({
  childName,
  exercises = [],
  onViewAll,
  onExerciseClick,
}) {
  const todaySource = useMemo(() => resolveTodayTasks(exercises), [exercises]);

  const tasks = useMemo(
    () => getDashboardPriorityTasks(todaySource),
    [todaySource],
  );

  const completion = useMemo(() => {
    const total = todaySource.length;
    const completed = todaySource.filter((exercise) => isCompletedStatus(exercise.status)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percent };
  }, [todaySource]);

  const completionLabel = completion.total > 0
    ? `${completion.completed} of ${completion.total} completed`
    : null;

  return (
    <section className="pd-card pd-card-pad pd-today-tasks pd-section-enter" aria-label="Today's tasks">
      <div className="pd-card-header pd-today-tasks-header">
        <div className="pd-today-tasks-heading">
          <h2 className="pd-section-title">Today&apos;s Tasks</h2>
          {completionLabel ? (
            <p className="pd-today-tasks-summary">{completionLabel}</p>
          ) : null}
          {completion.total > 0 ? (
            <div
              className="pd-today-tasks-progress"
              role="progressbar"
              aria-valuenow={completion.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${completion.completed} of ${completion.total} tasks completed`}
            >
              <span className="pd-today-tasks-progress-fill" style={{ "--pd-task-progress": `${completion.percent}%` }} />
            </div>
          ) : null}
        </div>
        <button type="button" className="pd-link" onClick={onViewAll}>
          See All
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="pd-today-tasks-empty">No tasks assigned for today.</p>
      ) : (
        <ul className="pd-today-tasks-list">
          {tasks.map((task, index) => {
            const completed = isCompletedStatus(task.status);
            const iconDescriptor = completed ? null : taskIconDescriptor();
            const tone = TASK_COLORS[index % TASK_COLORS.length];
            const statusMeta = exerciseStatusMeta[task.status] || exerciseStatusMeta.todo;
            const subtitle = [childName, task.duration, task.category].filter(Boolean).join(" · ");

            return (
              <li key={task.id}>
                <button
                  type="button"
                  className={`pd-today-task-row${completed ? " is-completed" : ""}`}
                  onClick={() => onExerciseClick?.(task)}
                  aria-label={`${task.title}. ${statusMeta.label}.`}
                >
                  <span className={`pd-today-task-icon pd-tone-${tone}${completed ? " is-completed" : ""}`} aria-hidden="true">
                    {completed ? (
                      <CheckCircle2 size={16} strokeWidth={1.75} />
                    ) : (
                      <PlatformMaterialIcon icon={iconDescriptor.key} size={16} />
                    )}
                  </span>
                  <span className="pd-today-task-copy">
                    <strong>{task.title}</strong>
                    <span>{subtitle}</span>
                  </span>
                  <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
                  <ChevronRight size={16} className="pd-today-task-chevron" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
