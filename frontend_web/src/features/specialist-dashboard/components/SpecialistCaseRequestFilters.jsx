import { ChevronDown, Search, X } from "lucide-react";
import {
  CASE_REQUEST_CATEGORY_ALL,
  CASE_REQUEST_STATUS_FILTERS,
} from "../utils/specialistCaseRequestMappers";

export function SpecialistCaseRequestFilters({
  searchInput,
  onSearchChange,
  statusFilterId,
  onStatusChange,
  categoryFilterId,
  onCategoryChange,
  categories = [],
  hasActiveFilters = false,
  onClearFilters,
}) {
  return (
    <section className="pd-specialist-case-request-filters" aria-label="Case request filters">
      <div className="pd-specialist-case-request-filter-field">
        <label className="pd-specialist-case-request-filter-label" htmlFor="sp-case-requests-search">
          Search by child name
        </label>
        <div className="pd-specialist-case-request-search">
          <Search size={18} aria-hidden="true" className="pd-specialist-case-request-search-icon" />
          <input
            id="sp-case-requests-search"
            type="search"
            className="pd-specialist-case-request-control pd-specialist-case-request-search-input"
            placeholder="Search by child name"
            value={searchInput}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
          {searchInput ? (
            <button
              type="button"
              className="pd-specialist-case-request-search-clear"
              aria-label="Clear search"
              onClick={() => onSearchChange?.("")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="pd-specialist-case-request-filter-row">
        <div className="pd-specialist-case-request-filter-field">
          <label className="pd-specialist-case-request-filter-label" htmlFor="sp-case-requests-status">
            Status
          </label>
          <div className="pd-specialist-case-request-select-wrap">
            <select
              id="sp-case-requests-status"
              className="pd-specialist-case-request-control pd-specialist-case-request-select"
              value={statusFilterId}
              onChange={(event) => onStatusChange?.(event.target.value)}
            >
              {CASE_REQUEST_STATUS_FILTERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pd-specialist-case-request-select-chevron"
            />
          </div>
        </div>

        <div className="pd-specialist-case-request-filter-field">
          <label className="pd-specialist-case-request-filter-label" htmlFor="sp-case-requests-category">
            Category
          </label>
          <div className="pd-specialist-case-request-select-wrap">
            <select
              id="sp-case-requests-category"
              className="pd-specialist-case-request-control pd-specialist-case-request-select"
              value={categoryFilterId}
              onChange={(event) => onCategoryChange?.(event.target.value)}
            >
              <option value={CASE_REQUEST_CATEGORY_ALL}>All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pd-specialist-case-request-select-chevron"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="pd-specialist-case-request-clear-row">
          <button type="button" className="pd-btn pd-btn-ghost" onClick={onClearFilters}>
            Clear Filters
          </button>
        </div>
      ) : null}
    </section>
  );
}
