import { Plus, Search } from "lucide-react";

export function AdminExercisesToolbar({
  searchQuery,
  categoryFilters,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddExercise,
}) {
  return (
    <section className="pd-admin-exercises-toolbar pd-section-enter" aria-label="Exercise library toolbar">
      <div className="pd-admin-exercises-toolbar-header">
        <div className="pd-admin-exercises-heading">
          <h1 className="pd-section-title">Exercise Library</h1>
          <p className="pd-section-sub">Browse therapy exercises by category and search.</p>
        </div>

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-admin-exercises-add-btn"
          onClick={onAddExercise}
        >
          <Plus size={16} aria-hidden="true" />
          Add Exercise
        </button>
      </div>

      <label className="pd-admin-exercises-search-wrap">
        <span className="pd-sr-only">Search exercises</span>
        <Search size={16} className="pd-admin-exercises-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="pd-admin-exercises-search"
          placeholder="Search by title, category, or instructions..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      {categoryFilters.length > 1 ? (
        <div className="pd-admin-exercises-category-scroll" role="group" aria-label="Category filters">
          <div className="pd-admin-exercises-category-row">
            {categoryFilters.map((category) => {
              const isSelected = category === selectedCategory;

              return (
                <button
                  key={category}
                  type="button"
                  className={`pd-admin-exercises-category-chip${isSelected ? " is-selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => onCategoryChange(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
