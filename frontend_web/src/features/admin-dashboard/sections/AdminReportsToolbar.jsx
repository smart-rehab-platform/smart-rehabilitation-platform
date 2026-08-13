import { Search } from "lucide-react";

export function AdminReportsToolbar({
  query,
  selectedFilter,
  filterOptions = [],
  onQueryChange,
  onFilterChange,
}) {
  return (
    <section className="pd-admin-reports-toolbar pd-section-enter" aria-label="Reports toolbar">
      <div className="pd-admin-reports-heading">
        <h1 className="pd-section-title">Reports</h1>
        <p className="pd-section-sub">Browse clinical and AI-generated patient reports.</p>
      </div>

      <label className="pd-admin-reports-search-wrap">
        <span className="pd-sr-only">Search by patient or title</span>
        <Search size={16} className="pd-admin-reports-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="pd-admin-reports-search"
          placeholder="Search by patient or title"
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
        />
      </label>

      {filterOptions.length > 0 ? (
        <div className="pd-admin-reports-filter-scroll" role="group" aria-label="Report filters">
          <div className="pd-admin-reports-filter-row">
            {filterOptions.map((option) => {
              const isSelected = option.id === selectedFilter;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`pd-admin-reports-filter-chip${isSelected ? " is-selected" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => onFilterChange?.(option.id)}
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
