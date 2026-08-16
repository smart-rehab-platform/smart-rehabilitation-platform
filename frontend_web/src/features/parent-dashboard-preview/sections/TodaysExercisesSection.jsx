import { useMemo } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
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

function resolveExerciseStatusLabel(status, t) {
  const key = `parent.exercises.status.${status}`;
  const label = t(key);
  return label || t("parent.common.unknown");
}

export function TodaysExercisesSection({
  childName,
  exercises = [],
  onViewAll,
  onExerciseClick,
}) {
  const { t } = useLocale();
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
    ? t("parent.home.completedCount", {
      completed: completion.completed,
      total: completion.total,
    })
    : null;

  return (
    <section className="pd-card pd-card-pad pd-today-tasks pd-section-enter" aria-label={t("parent.home.todaysTasks")}>
      <div className="pd-card-header pd-today-tasks-header">
        <div className="pd-today-tasks-heading">
          <h2 className="pd-section-title">{t("parent.home.todaysTasks")}</h2>
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
              aria-label={t("parent.home.tasksProgressAria", {
                completed: completion.completed,
                total: completion.total,
              })}
            >
              <span className="pd-today-tasks-progress-fill" style={{ "--pd-task-progress": `${completion.percent}%` }} />
            </div>
          ) : null}
        </div>
        <button type="button" className="pd-link" onClick={onViewAll}>
          {t("parent.home.seeAll")}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="pd-today-tasks-empty">{t("parent.home.noTasksToday")}</p>
      ) : (
        <ul className="pd-today-tasks-list">
          {tasks.map((task, index) => {
            const completed = isCompletedStatus(task.status);
            const iconDescriptor = completed ? null : taskIconDescriptor();
            const tone = TASK_COLORS[index % TASK_COLORS.length];
            const statusLabel = resolveExerciseStatusLabel(task.status, t);
            const subtitle = [childName, task.duration, task.category].filter(Boolean).join(" · ");

            return (
              <li key={task.id}>
                <button
                  type="button"
                  className={`pd-today-task-row${completed ? " is-completed" : ""}`}
                  onClick={() => onExerciseClick?.(task)}
                  aria-label={`${task.title}. ${statusLabel}.`}
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
                  <StatusBadge label={statusLabel} tone={completed ? "success" : task.status === "needs_retry" ? "danger" : task.status === "reviewed" ? "purple" : "gray"} />
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
