import { Paperclip } from "lucide-react";
import { exerciseStatusMeta } from "../../mock/parentDashboardMock";
import { StatusBadge } from "../StatusBadge";
import { getTaskHubActionLabel } from "../../utils/parentDailyTasksUtils";

export function TaskCard({ task, onOpen }) {
  const statusMeta = exerciseStatusMeta[task.status] || exerciseStatusMeta.todo;
  const actionLabel = getTaskHubActionLabel(task.status);

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          <h3 className="pd-task-hub-card-title">{task.title}</h3>
          {task.childName ? (
            <p className="pd-task-hub-card-child">For {task.childName}</p>
          ) : null}
        </div>
        <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
      </div>

      {(task.frequency || task.dueDate) ? (
        <ul className="pd-task-hub-card-meta">
          {task.frequency ? (
            <li>
              <strong>Frequency</strong>
              <span>{task.frequency}</span>
            </li>
          ) : null}
          {task.dueDate ? (
            <li>
              <strong>Due date</strong>
              <span>{task.dueDate}</span>
            </li>
          ) : null}
        </ul>
      ) : null}

      {task.instructionPreview ? (
        <p className="pd-task-hub-card-preview">{task.instructionPreview}</p>
      ) : null}

      {task.hasInstructionMedia ? (
        <p className="pd-task-hub-card-media">
          <Paperclip size={14} aria-hidden="true" />
          Instruction media included
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
