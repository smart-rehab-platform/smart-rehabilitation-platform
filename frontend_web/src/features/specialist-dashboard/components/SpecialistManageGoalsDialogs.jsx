import { useEffect, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { SpecialistGoalTermSelector } from "./SpecialistManageGoalsPatientHeader";
import { GOAL_TERMS } from "../utils/specialistGoalsMappers";
import { getGoalsValidationMessage } from "../utils/specialistGoalsLocalization";
import {
  GOALS_VALIDATION_KEYS,
  parseGoalTargetValueInput,
  validateCreateGoalForm,
  validateUpdateGoalForm,
} from "../utils/specialistGoalsMappers";

export function SpecialistAddGoalDialog({ open, onClose, onSubmit, isSaving, planId }) {
  const { t } = useLocale();
  const [term, setTerm] = useState(GOAL_TERMS.SHORT_TERM);
  const [title, setTitle] = useState("");
  const [targetValueText, setTargetValueText] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTerm(GOAL_TERMS.SHORT_TERM);
    setTitle("");
    setTargetValueText("");
    setTargetDate("");
    setDescription("");
    setError(null);
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationKey = validateCreateGoalForm({ title, targetValueText, planId });
    if (validationKey) {
      setError(getGoalsValidationMessage(validationKey, t));
      return;
    }

    const { error: targetError } = parseGoalTargetValueInput(targetValueText);
    if (targetError) {
      setError(getGoalsValidationMessage(targetError, t));
      return;
    }

    const result = await onSubmit?.({
      term,
      title,
      targetValueText,
      targetDate,
      description,
    });

    if (result?.ok) {
      onClose?.();
      return;
    }

    setError(result?.message || t("specialist.goals.actionFailed"));
  };

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="pd-modal pd-specialist-manage-goals-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-add-goal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-add-goal-title" className="pd-modal-title">
          {t("specialist.goals.addDialogTitle")}
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="pd-specialist-manage-goals-dialog-form">
          <label className="pd-field-label">{t("specialist.goals.goalType")}</label>
          <SpecialistGoalTermSelector term={term} onChange={setTerm} disabled={isSaving} />

          <label className="pd-field-label" htmlFor="specialist-goal-title">
            {t("specialist.goals.titleLabel")}
          </label>
          <input
            id="specialist-goal-title"
            className="pd-input"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
            dir="auto"
          />

          <label className="pd-field-label" htmlFor="specialist-goal-target-value">
            {t("specialist.goals.targetValueOptional")}
          </label>
          <input
            id="specialist-goal-target-value"
            className="pd-input"
            type="text"
            inputMode="decimal"
            value={targetValueText}
            onChange={(event) => {
              setTargetValueText(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
            dir="ltr"
          />

          <label className="pd-field-label" htmlFor="specialist-goal-target-date">
            {t("specialist.goals.targetDateOptional")}
          </label>
          <input
            id="specialist-goal-target-date"
            className="pd-input"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            disabled={isSaving}
            dir="ltr"
          />

          <label className="pd-field-label" htmlFor="specialist-goal-description">
            {t("specialist.goals.descriptionOptional")}
          </label>
          <textarea
            id="specialist-goal-description"
            className="pd-textarea"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSaving}
            dir="auto"
          />

          {error ? <p className="pd-inline-error">{error}</p> : null}
          <div className="pd-modal-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()} disabled={isSaving}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSaving}>
              {isSaving ? t("specialist.patientDetails.savingNote") : t("specialist.goals.addGoal")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateInputValue(isoValue) {
  if (!isoValue) {
    return "";
  }
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SpecialistEditGoalDialog({ open, goal, onClose, onSubmit, isSaving }) {
  const { t } = useLocale();
  const [title, setTitle] = useState("");
  const [targetValueText, setTargetValueText] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isAchieved, setIsAchieved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !goal) {
      return;
    }
    setTitle(goal.title || "");
    setTargetValueText(goal.targetValue != null ? String(goal.targetValue) : "");
    setTargetDate(formatDateInputValue(goal.targetDate));
    setIsAchieved(Boolean(goal.isAchieved));
    setError(null);
  }, [open, goal]);

  if (!open || !goal) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationKey = validateUpdateGoalForm({ title, targetValueText });
    if (validationKey === GOALS_VALIDATION_KEYS.TITLE_REQUIRED) {
      setError(getGoalsValidationMessage(validationKey, t));
      return;
    }
    if (validationKey) {
      setError(getGoalsValidationMessage(validationKey, t));
      return;
    }

    const { error: targetError } = parseGoalTargetValueInput(targetValueText);
    if (targetError) {
      setError(getGoalsValidationMessage(targetError, t));
      return;
    }

    const result = await onSubmit?.({
      title,
      targetValueText,
      targetDate,
      isAchieved,
    });

    if (result?.ok) {
      onClose?.();
      return;
    }

    setError(result?.message || t("specialist.goals.actionFailed"));
  };

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="pd-modal pd-specialist-manage-goals-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-edit-goal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-edit-goal-title" className="pd-modal-title">
          {t("specialist.goals.editDialogTitle")}
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="pd-specialist-manage-goals-dialog-form">
          <label className="pd-field-label" htmlFor="specialist-edit-goal-title-input">
            {t("specialist.goals.titleLabel")}
          </label>
          <input
            id="specialist-edit-goal-title-input"
            className="pd-input"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
            dir="auto"
          />

          <label className="pd-field-label" htmlFor="specialist-edit-goal-target-value">
            {t("specialist.goals.targetValueOptional")}
          </label>
          <input
            id="specialist-edit-goal-target-value"
            className="pd-input"
            type="text"
            inputMode="decimal"
            value={targetValueText}
            onChange={(event) => {
              setTargetValueText(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
            dir="ltr"
          />

          <label className="pd-field-label" htmlFor="specialist-edit-goal-target-date">
            {t("specialist.goals.targetDateOptional")}
          </label>
          <input
            id="specialist-edit-goal-target-date"
            className="pd-input"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            disabled={isSaving}
            dir="ltr"
          />

          <div className="pd-specialist-manage-goals-switch-row">
            <span
              className="pd-specialist-manage-goals-switch-label"
              id="specialist-edit-goal-achieved-label"
            >
              {t("specialist.goals.markAsAchieved")}
            </span>
            <label className="pd-specialist-manage-goals-switch">
              <input
                type="checkbox"
                className="pd-specialist-manage-goals-switch-input"
                checked={isAchieved}
                onChange={(event) => setIsAchieved(event.target.checked)}
                disabled={isSaving}
                role="switch"
                aria-checked={isAchieved}
                aria-labelledby="specialist-edit-goal-achieved-label"
              />
              <span className="pd-specialist-manage-goals-switch-track" aria-hidden="true">
                <span className="pd-specialist-manage-goals-switch-thumb" />
              </span>
            </label>
          </div>

          {error ? <p className="pd-inline-error">{error}</p> : null}
          <div className="pd-modal-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()} disabled={isSaving}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSaving}>
              {isSaving ? t("specialist.patientDetails.savingNote") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SpecialistUpdateGoalProgressDialog({ open, goal, onClose, onSubmit, isSaving }) {
  const { t } = useLocale();
  const [progressText, setProgressText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !goal) {
      return;
    }
    setProgressText(String(goal.completionPercent ?? 0));
    setNotes("");
    setError(null);
  }, [open, goal]);

  if (!open || !goal) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsed = Number(progressText.trim());
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      setError(getGoalsValidationMessage(GOALS_VALIDATION_KEYS.PROGRESS_RANGE, t));
      return;
    }

    const result = await onSubmit?.({ progressText, notes });
    if (result?.ok) {
      onClose?.();
      return;
    }

    setError(result?.message || t("specialist.goals.actionFailed"));
  };

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="pd-modal pd-specialist-manage-goals-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-update-progress-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-update-progress-title" className="pd-modal-title">
          {t("specialist.goals.updateProgressDialogTitle")}
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off" className="pd-specialist-manage-goals-dialog-form">
          <p className="pd-specialist-manage-goals-dialog-goal-title" dir="auto">
            <strong>{goal.title}</strong>
          </p>

          <label className="pd-field-label" htmlFor="specialist-goal-progress">
            {t("specialist.goals.completionPercentage")}
          </label>
          <input
            id="specialist-goal-progress"
            className="pd-input"
            type="text"
            inputMode="decimal"
            value={progressText}
            onChange={(event) => {
              setProgressText(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
            dir="ltr"
          />

          <label className="pd-field-label" htmlFor="specialist-goal-progress-notes">
            {t("specialist.goals.progressNoteOptional")}
          </label>
          <textarea
            id="specialist-goal-progress-notes"
            className="pd-textarea"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={isSaving}
            dir="auto"
          />

          {error ? <p className="pd-inline-error">{error}</p> : null}
          <div className="pd-modal-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()} disabled={isSaving}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={isSaving}>
              {isSaving ? t("specialist.patientDetails.savingNote") : t("specialist.goals.saveProgress")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
