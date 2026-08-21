import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { buildSessionStatusFilterOptions } from "../../utils/parentSessionsUtils";

export function SessionFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  status,
  onStatusChange,
  children = [],
  showSearch = true,
}) {
  const { t } = useLocale();
  const statusOptions = useMemo(
    () => buildSessionStatusFilterOptions(t),
    [t],
  );

  return (
    <div className="pd-task-hub-filters pd-sessions-filters">
      {showSearch ? (
        <div className="pd-task-hub-filter pd-task-hub-filter-search">
          <label className="pd-form-label" htmlFor="pd-sessions-hub-search">
            {t("parent.common.search")}
          </label>
          <input
            id="pd-sessions-hub-search"
            type="search"
            className="pd-form-input"
            placeholder={t("parent.sessions.searchPlaceholder")}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      ) : null}

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-sessions-hub-child">
          {t("parent.common.child")}
        </label>
        <select
          id="pd-sessions-hub-child"
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
        <label className="pd-form-label" htmlFor="pd-sessions-hub-status">
          {t("parent.common.status")}
        </label>
        <select
          id="pd-sessions-hub-status"
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
    </div>
  );
}
