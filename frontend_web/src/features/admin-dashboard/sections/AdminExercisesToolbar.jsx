import { useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminExercisesLabels } from "../utils/adminExercisesLocalization.js";

export function AdminExercisesToolbar({
  searchQuery,
  categoryFilterOptions,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddExercise,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);

  return (
    <section className="pd-admin-exercises-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-exercises-toolbar-header">
        <div className="pd-admin-exercises-heading">
          <h1 className="pd-section-title">{labels.title}</h1>
          <p className="pd-section-sub">{labels.subtitle}</p>
        </div>

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-admin-exercises-add-btn"
          onClick={onAddExercise}
        >
          <Plus size={16} aria-hidden="true" />
          {labels.addExercise}
        </button>
      </div>

      <label className="pd-admin-exercises-search-wrap">
        <span className="pd-sr-only">{labels.searchAriaLabel}</span>
        <Search size={16} className="pd-admin-exercises-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="pd-admin-exercises-search"
          placeholder={labels.searchPlaceholder}
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      {categoryFilterOptions.length > 1 ? (
        <div className="pd-admin-exercises-category-scroll" role="group" aria-label={labels.categoryFiltersAriaLabel}>
          <div className="pd-admin-exercises-category-row">
            {categoryFilterOptions.map((option) => {
              const isSelected = option.value === selectedCategory;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`pd-admin-exercises-category-chip${isSelected ? " is-selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => onCategoryChange(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
