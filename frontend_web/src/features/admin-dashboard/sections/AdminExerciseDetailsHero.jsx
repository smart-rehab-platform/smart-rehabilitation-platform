import { Pencil, Trash2 } from "lucide-react";
import {
  resolveExerciseCategoryIconBackground,
  resolveExerciseCategoryIconColor,
} from "../utils/adminExerciseCategoryVisuals";
import { AdminExerciseCategoryIcon } from "../components/AdminExerciseCategoryIcon";

export function AdminExerciseDetailsHero({
  exercise,
  canEdit = true,
  onEdit,
  onDelete,
}) {
  const iconColor = resolveExerciseCategoryIconColor(exercise.categoryName);
  const iconBackground = resolveExerciseCategoryIconBackground(exercise.categoryName);
  const createdByName = exercise.createdByName?.trim() || "";

  return (
    <section className="pd-card pd-card-pad pd-admin-exercise-details-hero pd-section-enter" aria-label="Exercise summary">
      <div className="pd-admin-exercise-details-hero-main">
        <div className="pd-admin-exercise-details-hero-left">
          <div
            className="pd-admin-exercise-details-hero-icon"
            style={{
              color: iconColor,
              backgroundColor: iconBackground,
            }}
            aria-hidden="true"
          >
            <AdminExerciseCategoryIcon categoryName={exercise.categoryName} size={28} />
          </div>

          <div className="pd-admin-exercise-details-hero-copy">
            <h1 className="pd-admin-exercise-details-title">{exercise.title}</h1>

            <div className="pd-admin-exercise-details-meta">
              {exercise.categoryName ? (
                <span className="pd-admin-exercise-details-category">{exercise.categoryName}</span>
              ) : null}
              <span className="pd-admin-exercise-details-language">{exercise.languageLabel}</span>
            </div>

            {createdByName ? (
              <p className="pd-admin-exercise-details-created-by">
                Created by
                {" "}
                {createdByName}
              </p>
            ) : null}
          </div>
        </div>

        {canEdit ? (
          <div className="pd-admin-exercise-details-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-admin-exercise-details-edit"
              onClick={onEdit}
            >
              <Pencil size={16} aria-hidden="true" />
              Edit Exercise
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-admin-exercise-details-delete"
              onClick={onDelete}
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete Exercise
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
