import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  buildAdminCaseStatusFilterOptions,
  getAdminCaseRequestsLabels,
} from "../utils/adminCaseRequestsLocalization.js";

export function AdminCaseRequestsToolbar({
  searchQuery,
  statusFilter,
  categoryFilter,
  categoryOptions,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminCaseRequestsLabels(t), [t]);
  const statusFilterOptions = useMemo(() => buildAdminCaseStatusFilterOptions(t), [t]);

  return (
    <section className="pd-admin-case-requests-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-case-requests-heading">
        <h1 className="pd-section-title">{labels.title}</h1>
        <p className="pd-section-sub">{labels.subtitle}</p>
      </div>

      <div className="pd-admin-case-requests-controls">
        <label className="pd-admin-case-requests-search-wrap">
          <span className="pd-sr-only">{labels.searchAriaLabel}</span>
          <input
            type="search"
            className="pd-admin-case-requests-search"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="pd-admin-case-requests-filter-wrap">
          <span className="pd-sr-only">{labels.statusFilterAriaLabel}</span>
          <select
            className="pd-admin-case-requests-filter"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
          >
            <option value="">{labels.allStatuses}</option>
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-case-requests-filter-wrap">
          <span className="pd-sr-only">{labels.categoryFilterAriaLabel}</span>
          <select
            className="pd-admin-case-requests-filter"
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
          >
            <option value="">{labels.allCategories}</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
