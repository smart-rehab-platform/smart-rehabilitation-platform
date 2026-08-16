import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  formatAdminPresenceLabel,
  getAdminUsersLabels,
} from "../utils/adminUsersLocalization.js";

function UserAvatar({ user }) {
  return (
    <span className={`pd-admin-users-avatar pd-admin-role-${user.roleTone}`}>
      {user.avatarInitial}
    </span>
  );
}

function PresenceDot({ isOnline }) {
  return (
    <span
      className={`pd-admin-users-presence-dot${isOnline ? " is-online" : ""}`}
      aria-hidden="true"
    />
  );
}

function RoleBadge({ user }) {
  return (
    <span className={`pd-admin-users-role pd-admin-role-${user.roleTone}`}>
      {user.roleLabel}
    </span>
  );
}

function StatusBadge({ isActive, labels }) {
  return (
    <span className={`pd-admin-users-status${isActive ? " is-active" : " is-inactive"}`}>
      {isActive ? labels.statusActive : labels.statusInactive}
    </span>
  );
}

function UserActions({ user, labels, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="pd-admin-users-actions">
      <button type="button" className="pd-btn pd-btn-soft pd-btn-compact" onClick={() => onEdit(user)}>
        {labels.actions.edit}
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-soft pd-btn-compact"
        onClick={() => onToggleStatus(user)}
      >
        {user.isActive ? labels.actions.deactivate : labels.actions.activate}
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-soft pd-btn-compact pd-btn-danger-outline"
        onClick={() => onDelete(user)}
      >
        {labels.actions.delete}
      </button>
    </div>
  );
}

function UserRow({
  user,
  presenceById,
  labels,
  mapperContext,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const presence = presenceById[user.id] ?? null;
  const lastSeenLabel = formatAdminPresenceLabel(presence, new Date(), mapperContext);

  return (
    <tr className="pd-admin-users-row">
      <td data-label={labels.columns.user}>
        <div className="pd-admin-users-user-cell">
          <span className="pd-admin-users-avatar-wrap">
            <UserAvatar user={user} />
            <PresenceDot isOnline={presence?.isOnline === true} />
          </span>
          <span className="pd-admin-users-name" dir="auto">{user.fullName}</span>
        </div>
      </td>
      <td data-label={labels.columns.email}>
        <span className="pd-admin-users-email" title={user.email} dir="auto">
          {user.email}
        </span>
      </td>
      <td data-label={labels.columns.role}>
        <RoleBadge user={user} />
      </td>
      <td data-label={labels.columns.status}>
        <StatusBadge isActive={user.isActive} labels={labels} />
      </td>
      <td data-label={labels.columns.lastSeen}>
        <span
          className={`pd-admin-users-last-seen${presence?.isOnline ? " is-online" : ""}`}
        >
          {lastSeenLabel}
        </span>
      </td>
      <td data-label={labels.columns.actions}>
        <UserActions
          user={user}
          labels={labels}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function LoadingRows({ loadingLabel }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-users-row pd-admin-users-row-loading">
          <td colSpan={6}>
            <span className="pd-inline-loading">{loadingLabel}</span>
          </td>
        </tr>
      ))}
    </>
  );
}

export function AdminUsersTable({
  users,
  presenceById,
  isLoading = false,
  emptyKind = null,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const { t, locale } = useLocale();
  const labels = useMemo(() => getAdminUsersLabels(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);

  return (
    <section className="pd-card pd-admin-users-table-wrap pd-section-enter" aria-label={labels.tableAriaLabel}>
      <div className="pd-admin-users-table-scroll">
        <table className="pd-admin-users-table">
          <thead>
            <tr>
              <th scope="col">{labels.columns.user}</th>
              <th scope="col">{labels.columns.email}</th>
              <th scope="col">{labels.columns.role}</th>
              <th scope="col">{labels.columns.status}</th>
              <th scope="col">{labels.columns.lastSeen}</th>
              <th scope="col">{labels.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows loadingLabel={labels.loading} />
            ) : emptyKind ? (
              <tr className="pd-admin-users-empty-row">
                <td colSpan={6}>
                  <p className="pd-admin-empty-copy">
                    {emptyKind === "no-users" ? labels.empty : labels.emptyFiltered}
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  presenceById={presenceById}
                  labels={labels}
                  mapperContext={mapperContext}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
