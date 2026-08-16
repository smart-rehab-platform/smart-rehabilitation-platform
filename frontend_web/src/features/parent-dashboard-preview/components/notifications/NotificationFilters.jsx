import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import {
  buildNotificationReadFilterOptions,
  buildNotificationSortOptions,
} from "../../utils/parentNotificationsUtils";

export function NotificationFilters({
  search,
  onSearchChange,
  readState,
  onReadStateChange,
  notificationType,
  onNotificationTypeChange,
  childId,
  onChildChange,
  sortKey,
  onSortChange,
  children = [],
  notificationTypeOptions = [],
}) {
  const { t } = useLocale();
  const readOptions = useMemo(() => buildNotificationReadFilterOptions(t), [t]);
  const sortOptions = useMemo(() => buildNotificationSortOptions(t), [t]);

  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-search">
          {t("parent.common.search")}
        </label>
        <input
          id="pd-notifications-hub-search"
          type="search"
          className="pd-form-input"
          placeholder={t("parent.notificationsPage.searchPlaceholder")}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-read">
          {t("parent.common.status")}
        </label>
        <select
          id="pd-notifications-hub-read"
          className="pd-form-select"
          value={readState}
          onChange={(event) => onReadStateChange(event.target.value)}
        >
          {readOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-type">
          {t("parent.common.type")}
        </label>
        <select
          id="pd-notifications-hub-type"
          className="pd-form-select"
          value={notificationType}
          onChange={(event) => onNotificationTypeChange(event.target.value)}
        >
          {notificationTypeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-child">
          {t("parent.common.child")}
        </label>
        <select
          id="pd-notifications-hub-child"
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
        <label className="pd-form-label" htmlFor="pd-notifications-hub-sort">
          {t("parent.common.sortBy")}
        </label>
        <select
          id="pd-notifications-hub-sort"
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
