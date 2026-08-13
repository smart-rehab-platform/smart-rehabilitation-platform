import { BookOpen, Dumbbell, Footprints, Hand, ImageIcon, Mic2, Pencil, Users } from "lucide-react";
import {
  EXERCISE_CATEGORY_ICON_KEYS,
  resolveExerciseCategoryIconBackground,
  resolveExerciseCategoryIconColor,
  resolveExerciseCategoryIconKey,
} from "../utils/adminExerciseCategoryVisuals";

const EXERCISE_CATEGORY_ICONS = {
  [EXERCISE_CATEGORY_ICON_KEYS.voice]: Mic2,
  [EXERCISE_CATEGORY_ICON_KEYS.language]: BookOpen,
  [EXERCISE_CATEGORY_ICON_KEYS.hand]: Hand,
  [EXERCISE_CATEGORY_ICON_KEYS.walk]: Footprints,
  [EXERCISE_CATEGORY_ICON_KEYS.users]: Users,
  [EXERCISE_CATEGORY_ICON_KEYS.default]: Dumbbell,
};

function ExerciseCategoryIcon({ categoryName }) {
  const iconKey = resolveExerciseCategoryIconKey(categoryName);
  const Icon = EXERCISE_CATEGORY_ICONS[iconKey] ?? EXERCISE_CATEGORY_ICONS[EXERCISE_CATEGORY_ICON_KEYS.default];

  return <Icon size={20} strokeWidth={2.1} />;
}

export function AdminExerciseCard({
  exercise,
  canEdit = true,
  onOpen,
  onEdit,
}) {
  const iconColor = resolveExerciseCategoryIconColor(exercise.categoryName);
  const iconBackground = resolveExerciseCategoryIconBackground(exercise.categoryName);
  const previewText = exercise.previewText || "No instructions available.";

  const handleCardClick = () => {
    onOpen?.(exercise.id);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    onEdit?.(exercise.id);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      className="pd-admin-exercise-card pd-section-enter"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open ${exercise.title}`}
    >
      <div className="pd-admin-exercise-card-top">
        <div
          className="pd-admin-exercise-card-icon"
          style={{
            color: iconColor,
            backgroundColor: iconBackground,
          }}
          aria-hidden="true"
        >
          <ExerciseCategoryIcon categoryName={exercise.categoryName} />
        </div>

        <div className="pd-admin-exercise-card-heading">
          <h2 className="pd-admin-exercise-card-title">{exercise.title}</h2>
        </div>

        {canEdit ? (
          <button
            type="button"
            className="pd-admin-exercise-card-edit"
            onClick={handleEditClick}
            aria-label={`Edit ${exercise.title}`}
          >
            <Pencil size={15} aria-hidden="true" />
            <span>Edit</span>
          </button>
        ) : null}
      </div>

      <div className="pd-admin-exercise-card-meta">
        {exercise.categoryName ? (
          <span className="pd-admin-exercise-card-category">{exercise.categoryName}</span>
        ) : null}
        <span className="pd-admin-exercise-card-language">{exercise.languageLabel}</span>
      </div>

      <p className="pd-admin-exercise-card-preview">{previewText}</p>

      {exercise.hasMedia ? (
        <div className="pd-admin-exercise-card-media">
          <ImageIcon size={14} aria-hidden="true" />
          <span>Includes instruction media</span>
        </div>
      ) : null}
    </article>
  );
}
