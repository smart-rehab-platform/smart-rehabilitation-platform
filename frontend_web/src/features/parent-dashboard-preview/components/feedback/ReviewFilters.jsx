import { useLocale } from "../../../../context/useLocale.js";

export function ReviewFilters({
  search,
  onSearchChange,
  childId,
  onChildChange,
  children = [],
}) {
  const { t } = useLocale();

  return (
    <div className="pd-task-hub-filters pd-feedback-filters">
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

      <div className="pd-task-hub-filter pd-feedback-filter-child">
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
    </div>
  );
}
