import {
  NOTIFICATION_READ_FILTER_OPTIONS,
  NOTIFICATION_SORT_OPTIONS,
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
  return (
    <div className="pd-task-hub-filters">
      <div className="pd-task-hub-filter pd-task-hub-filter-search">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-search">
          Search
        </label>
        <input
          id="pd-notifications-hub-search"
          type="search"
          className="pd-form-input"
          placeholder="Search by title, message, or child"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-read">
          Status
        </label>
        <select
          id="pd-notifications-hub-read"
          className="pd-form-select"
          value={readState}
          onChange={(event) => onReadStateChange(event.target.value)}
        >
          {NOTIFICATION_READ_FILTER_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-type">
          Type
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
          Child
        </label>
        <select
          id="pd-notifications-hub-child"
          className="pd-form-select"
          value={childId}
          onChange={(event) => onChildChange(event.target.value)}
        >
          <option value="all">All children</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="pd-task-hub-filter">
        <label className="pd-form-label" htmlFor="pd-notifications-hub-sort">
          Sort by
        </label>
        <select
          id="pd-notifications-hub-sort"
          className="pd-form-select"
          value={sortKey}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {NOTIFICATION_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
