import { Paperclip } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { StatusBadge } from "../StatusBadge";
import { getTaskHubActionLabel, getTaskStatusMeta } from "../../utils/parentDailyTasksUtils";

export function TaskCard({ task, onOpen }) {
  const { t } = useLocale();
  const statusMeta = getTaskStatusMeta(task.status, t);
  const actionLabel = getTaskHubActionLabel(task.status, t);

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          <h3 className="pd-task-hub-card-title" dir="auto">{task.title}</h3>
          {task.childName ? (
            <p className="pd-task-hub-card-child">
              {t("parent.pages.exerciseDetail.forChild", { name: task.childName })}
            </p>
          ) : null}
        </div>
        <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
      </div>

      {(task.frequency || task.dueDate) ? (
        <ul className="pd-task-hub-card-meta">
          {task.frequency ? (
            <li>
              <strong>{t("parent.pages.exerciseDetail.frequency")}</strong>
              <span>{task.frequency}</span>
            </li>
          ) : null}
          {task.dueDate ? (
            <li>
              <strong>{t("parent.pages.exerciseDetail.dueDate")}</strong>
              <span>{task.dueDate}</span>
            </li>
          ) : null}
        </ul>
      ) : null}

      {task.instructionPreview ? (
        <p className="pd-task-hub-card-preview" dir="auto">{task.instructionPreview}</p>
      ) : null}

      {task.hasInstructionMedia ? (
        <p className="pd-task-hub-card-media">
          <Paperclip size={14} aria-hidden="true" />
          {t("parent.exercises.instructionMediaIncluded", "Instruction media included")}
        </p>
      ) : null}

      <div className="pd-task-hub-card-actions">
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={() => onOpen?.(task)}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
