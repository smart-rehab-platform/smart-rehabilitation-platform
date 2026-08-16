import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildHubSortOptions,
  buildHubStatusFilterOptions,
} from "../../utils/parentDailyTasksUtils";

export function TaskFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  status,
  onStatusChange,
  sortKey,
  onSortChange,
  children = [],
}) {
  const { t } = useLocale();
  const sortOptions = useMemo(() => buildHubSortOptions(t), [t]);
  const statusOptions = useMemo(() => buildHubStatusFilterOptions(t), [t]);

  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-task-hub-search">
          {t("parent.common.search")}
        </label>
        <input
          id="pd-task-hub-search"
          type="search"
          className="pd-form-input"
          placeholder={t("parent.common.searchPlaceholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-task-hub-child">
          {t("parent.common.child")}
        </label>
        <select
          id="pd-task-hub-child"
          className="pd-form-select"
          value={childId}
          onChange={(event) => onChildChange(event.target.value)}
        >
          <option value="all">{t("parent.common.allChildren")}</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-task-hub-status">
          {t("parent.common.status")}
        </label>
        <select
          id="pd-task-hub-status"
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
        <label className="pd-form-label" htmlFor="pd-task-hub-sort">
          {t("parent.caseRequests.sortLabel", "Sort by")}
        </label>
        <select
          id="pd-task-hub-sort"
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
