import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildCaseRequestSortOptions,
  buildCaseRequestStatusFilterOptions,
} from "../../utils/parentCaseRequestsLocalization";

export function CaseRequestFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortKey,
  onSortChange,
}) {
  const { t } = useLocale();

  const statusOptions = useMemo(
    () => buildCaseRequestStatusFilterOptions(t),
    [t],
  );

  const sortOptions = useMemo(
    () => buildCaseRequestSortOptions(t),
    [t],
  );

  return (
    <div className="pd-task-hub-filters pd-case-request-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-case-requests-search">
          {t("common.search")}
        </label>
        <input
          id="pd-case-requests-search"
          type="search"
          className="pd-form-input"
          placeholder={t("parent.caseRequests.searchPlaceholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-case-requests-status">
          {t("parent.common.status")}
        </label>
        <select
          id="pd-case-requests-status"
          className="pd-form-select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-case-requests-sort">
          {t("parent.caseRequests.sortLabel")}
        </label>
        <select
          id="pd-case-requests-sort"
          className="pd-form-select"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
