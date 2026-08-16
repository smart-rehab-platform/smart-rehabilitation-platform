import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildFeedbackSortOptions,
  buildFeedbackStatusFilterOptions,
} from "../../utils/parentFeedbackUtils";

export function ReviewFilters({
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

  const statusOptions = useMemo(
    () => buildFeedbackStatusFilterOptions(t),
    [t],
  );

  const sortOptions = useMemo(
    () => buildFeedbackSortOptions(t),
    [t],
  );

  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-feedback-hub-search">
          {t("parent.common.search")}
        </label>
        <input
          id="pd-feedback-hub-search"
          type="search"
          className="pd-form-input"
          placeholder={t("parent.feedback.searchPlaceholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-feedback-hub-child">
          {t("parent.common.child")}
        </label>
        <select
          id="pd-feedback-hub-child"
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
        <label className="pd-form-label" htmlFor="pd-feedback-hub-status">
          {t("parent.common.status")}
        </label>
        <select
          id="pd-feedback-hub-status"
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
        <label className="pd-form-label" htmlFor="pd-feedback-hub-sort">
          {t("parent.common.sortBy")}
        </label>
        <select
          id="pd-feedback-hub-sort"
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
