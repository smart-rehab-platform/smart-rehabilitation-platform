import { formatPresenceLabel } from "../utils/adminUsersMappers";

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

function StatusBadge({ isActive }) {
  return (
    <span className={`pd-admin-users-status${isActive ? " is-active" : " is-inactive"}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function UserActions({ user, onEdit, onToggleStatus, onDelete }) {
  return (
    <div className="pd-admin-users-actions">
      <button type="button" className="pd-btn pd-btn-soft pd-btn-compact" onClick={() => onEdit(user)}>
        Edit
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-soft pd-btn-compact"
        onClick={() => onToggleStatus(user)}
      >
        {user.isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-soft pd-btn-compact pd-btn-danger-outline"
        onClick={() => onDelete(user)}
      >
        Delete
      </button>
    </div>
  );
}

function UserRow({
  user,
  presenceById,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const presence = presenceById[user.id] ?? null;
  const lastSeenLabel = formatPresenceLabel(presence);

  return (
    <tr className="pd-admin-users-row">
      <td data-label="User">
        <div className="pd-admin-users-user-cell">
          <span className="pd-admin-users-avatar-wrap">
            <UserAvatar user={user} />
            <PresenceDot isOnline={presence?.isOnline === true} />
          </span>
          <span className="pd-admin-users-name">{user.fullName}</span>
        </div>
      </td>
      <td data-label="Email">
        <span className="pd-admin-users-email" title={user.email}>
          {user.email}
        </span>
      </td>
      <td data-label="Role">
        <RoleBadge user={user} />
      </td>
      <td data-label="Status">
        <StatusBadge isActive={user.isActive} />
      </td>
      <td data-label="Last Seen">
        <span
          className={`pd-admin-users-last-seen${presence?.isOnline ? " is-online" : ""}`}
        >
          {lastSeenLabel}
        </span>
      </td>
      <td data-label="Actions">
        <UserActions
          user={user}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <tr key={index} className="pd-admin-users-row pd-admin-users-row-loading">
          <td colSpan={6}>
            <span className="pd-inline-loading">Loading users...</span>
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
  return (
    <section className="pd-card pd-admin-users-table-wrap pd-section-enter" aria-label="Users list">
      <div className="pd-admin-users-table-scroll">
        <table className="pd-admin-users-table">
          <thead>
            <tr>
              <th scope="col">User</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Last Seen</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows />
            ) : emptyKind ? (
              <tr className="pd-admin-users-empty-row">
                <td colSpan={6}>
                  <p className="pd-admin-empty-copy">
                    {emptyKind === "no-users"
                      ? "No users have been created yet."
                      : "No users match your search or filter."}
                  </p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  presenceById={presenceById}
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
