import { useLocale } from "../../../context/useLocale";
import { getExerciseCategoryLabel } from "../utils/specialistExercisesLocalization";

export function SpecialistExerciseCategoryFilters({ categories, selectedCategory, onChange }) {
  const { t } = useLocale();

  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <div
      className="pd-specialist-exercise-filters"
      role="group"
      aria-label={t("specialist.exercises.filters.ariaLabel")}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            className={`pd-specialist-exercise-filter-chip${isSelected ? " is-selected" : ""}`}
            onClick={() => onChange(category)}
            aria-pressed={isSelected}
          >
            {getExerciseCategoryLabel(category, t)}
          </button>
        );
      })}
    </div>
  );
}

export function SpecialistExerciseSearchField({ value, onChange }) {
  const { t } = useLocale();

  return (
    <label className="pd-specialist-exercise-search">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pd-specialist-exercise-search-icon">
        <path
          d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm8.35 2.15-3.9-3.9"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      <input
        type="search"
        className="pd-specialist-exercise-search-input"
        aria-label={t("specialist.exercises.search.ariaLabel")}
        placeholder={t("specialist.exercises.search.placeholder")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
