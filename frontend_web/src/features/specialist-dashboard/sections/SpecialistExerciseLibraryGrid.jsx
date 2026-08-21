import { useLocale } from "../../../context/useLocale";
import {
  SpecialistExerciseCard,
  SpecialistExerciseCardSkeleton,
} from "../components/SpecialistExerciseCard";
import {
  SpecialistExerciseCategoryFilters,
  SpecialistExerciseSearchField,
} from "../components/SpecialistExerciseLibraryControls";

export function SpecialistExerciseLibraryGrid({
  exercises,
  visibleExercises,
  categoryFilters,
  isLoading,
  error,
  searchQuery,
  selectedCategory,
  emptyMessage,
  onSearchChange,
  onCategoryChange,
  onRetry,
  onExerciseClick,
  selectedExerciseId = "",
}) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="pd-specialist-exercise-library">
        <SpecialistExerciseSearchField value="" onChange={() => {}} />
        <div className="pd-specialist-exercise-grid" aria-busy="true" aria-label={t("specialist.exercises.loading")}>
          {Array.from({ length: 6 }, (_, index) => (
            <SpecialistExerciseCardSkeleton key={`exercise-skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error && exercises.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-error">{error}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          {t("common.retry")}
        </button>
      </section>
    );
  }

  return (
    <div className="pd-specialist-exercise-library">
      <SpecialistExerciseSearchField value={searchQuery} onChange={onSearchChange} />
      <SpecialistExerciseCategoryFilters
        categories={categoryFilters}
        selectedCategory={selectedCategory}
        onChange={onCategoryChange}
      />

      {error ? (
        <div className="pd-specialist-exercise-inline-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onRetry}>
            {t("common.retry")}
          </button>
        </div>
      ) : null}

      {emptyMessage ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{emptyMessage}</p>
        </section>
      ) : (
        <div className="pd-specialist-exercise-grid">
          {visibleExercises.map((exercise) => (
            <SpecialistExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={onExerciseClick}
              isSelected={selectedExerciseId === exercise.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
