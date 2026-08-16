import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildReportSortOptions } from "../../utils/parentReportsUtils";

export function ReportFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  reportType,
  onReportTypeChange,
  sortKey,
  onSortChange,
  children = [],
  reportTypeOptions = [],
}) {
  const { t } = useLocale();
  const sortOptions = useMemo(() => buildReportSortOptions(t), [t]);

  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-reports-hub-search">
          {t("parent.common.search")}
        </label>
        <input
          id="pd-reports-hub-search"
          type="search"
          className="pd-form-input"
          placeholder={t("parent.reports.searchPlaceholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-reports-hub-child">
          {t("parent.common.child")}
        </label>
        <select
          id="pd-reports-hub-child"
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
        <label className="pd-form-label" htmlFor="pd-reports-hub-type">
          {t("parent.common.reportType")}
        </label>
        <select
          id="pd-reports-hub-type"
          className="pd-form-select"
          value={reportType}
          onChange={(event) => onReportTypeChange(event.target.value)}
        >
          {reportTypeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-reports-hub-sort">
          {t("parent.common.sortBy")}
        </label>
        <select
          id="pd-reports-hub-sort"
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
