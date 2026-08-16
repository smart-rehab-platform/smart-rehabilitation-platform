import { ChevronDown, Search, X } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import {
  CASE_REQUEST_CATEGORY_ALL,
  buildCaseRequestStatusFilters,
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
  const { t } = useLocale();
  const statusFilters = buildCaseRequestStatusFilters(t);

  return (
    <section className="pd-specialist-case-request-filters" aria-label={t("specialist.caseRequests.filters.ariaLabel")}>
      <div className="pd-specialist-case-request-filter-field">
        <label className="pd-specialist-case-request-filter-label" htmlFor="sp-case-requests-search">
          {t("specialist.caseRequests.filters.searchLabel")}
        </label>
        <div className="pd-specialist-case-request-search">
          <Search size={18} aria-hidden="true" className="pd-specialist-case-request-search-icon" />
          <input
            id="sp-case-requests-search"
            type="search"
            className="pd-specialist-case-request-control pd-specialist-case-request-search-input"
            placeholder={t("specialist.caseRequests.filters.searchPlaceholder")}
            value={searchInput}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
          {searchInput ? (
            <button
              type="button"
              className="pd-specialist-case-request-search-clear"
              aria-label={t("specialist.caseRequests.filters.clearSearchAriaLabel")}
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
            {t("specialist.caseRequests.filters.statusLabel")}
          </label>
          <div className="pd-specialist-case-request-select-wrap">
            <select
              id="sp-case-requests-status"
              className="pd-specialist-case-request-control pd-specialist-case-request-select"
              value={statusFilterId}
              onChange={(event) => onStatusChange?.(event.target.value)}
            >
              {statusFilters.map((option) => (
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
            {t("specialist.caseRequests.filters.categoryLabel")}
          </label>
          <div className="pd-specialist-case-request-select-wrap">
            <select
              id="sp-case-requests-category"
              className="pd-specialist-case-request-control pd-specialist-case-request-select"
              value={categoryFilterId}
              onChange={(event) => onCategoryChange?.(event.target.value)}
            >
              <option value={CASE_REQUEST_CATEGORY_ALL}>
                {t("specialist.caseRequests.filters.allCategories")}
              </option>
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
            {t("specialist.caseRequests.clearFilters")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
