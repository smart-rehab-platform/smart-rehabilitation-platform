import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  getAdminUsersLabels,
  getAdminUsersRoleFilterOptions,
} from "../utils/adminUsersLocalization.js";

export function AdminUsersToolbar({
  searchQuery,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
  onAddUser,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminUsersLabels(t), [t]);
  const roleFilters = useMemo(() => getAdminUsersRoleFilterOptions(t), [t]);

  return (
    <section className="pd-admin-users-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-users-toolbar-top">
        <div className="pd-admin-users-heading">
          <h1 className="pd-section-title">{labels.title}</h1>
          <p className="pd-section-sub">{labels.subtitle}</p>
        </div>
        <button type="button" className="pd-btn pd-btn-primary" onClick={onAddUser}>
          + {labels.addUser}
        </button>
      </div>

      <div className="pd-admin-users-controls">
        <label className="pd-admin-users-search-wrap">
          <span className="pd-sr-only">{labels.searchAriaLabel}</span>
          <input
            type="search"
            className="pd-admin-users-search"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <div className="pd-admin-users-filters" role="tablist" aria-label={labels.roleFiltersAriaLabel}>
          {roleFilters.map((filter) => {
            const selected = roleFilter === filter.value;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`pd-admin-users-filter${selected ? " is-selected" : ""}`}
                onClick={() => onRoleFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
