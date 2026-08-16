import { useMemo } from "react";
import { Search } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import {
  buildAdminSessionStatusFilterOptions,
  getAdminSessionsLabels,
} from "../utils/adminSessionsLocalization.js";

export function AdminSessionsToolbar({
  searchQuery,
  selectedStatus,
  onSearchChange,
  onStatusChange,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminSessionsLabels(t), [t]);
  const statusFilterOptions = useMemo(() => buildAdminSessionStatusFilterOptions(t), [t]);

  return (
    <section className="pd-admin-sessions-toolbar pd-section-enter" aria-label={labels.toolbarAriaLabel}>
      <div className="pd-admin-sessions-heading">
        <h1 className="pd-section-title">{labels.title}</h1>
        <p className="pd-section-sub">{labels.subtitle}</p>
      </div>

      <div className="pd-admin-sessions-controls">
        <label className="pd-admin-sessions-search-wrap">
          <span className="pd-sr-only">{labels.searchAriaLabel}</span>
          <Search size={16} className="pd-admin-sessions-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="pd-admin-sessions-search"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label={labels.searchAriaLabel}
          />
        </label>

        <label className="pd-admin-sessions-filter-wrap">
          <span className="pd-sr-only">{labels.statusFilterAriaLabel}</span>
          <select
            className="pd-admin-sessions-filter"
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value)}
            aria-label={labels.statusFilterAriaLabel}
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
