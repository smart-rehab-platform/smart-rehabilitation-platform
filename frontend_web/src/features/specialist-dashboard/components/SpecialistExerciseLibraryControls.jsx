import { EXERCISE_SEARCH_PLACEHOLDER } from "../utils/specialistExerciseMappers";

export function SpecialistExerciseCategoryFilters({ categories, selectedCategory, onChange }) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  return (
    <div className="pd-specialist-exercise-filters" role="group" aria-label="Exercise category filters">
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
            {category}
          </button>
        );
      })}
    </div>
  );
}

export function SpecialistExerciseSearchField({ value, onChange }) {
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
        aria-label="Search exercises"
        placeholder={EXERCISE_SEARCH_PLACEHOLDER}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
