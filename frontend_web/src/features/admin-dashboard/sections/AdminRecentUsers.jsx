import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getAdminRoleTone, getAvatarInitial } from "../utils/adminDashboardMappers";

function RecentUserRow({ user }) {
  const tone = getAdminRoleTone(user.rawRole);
  const initials = getAvatarInitial(user.name);

  return (
    <li className="pd-admin-recent-user-row">
      <UserProfileAvatar
        initials={initials}
        fallbackClassName={`pd-avatar pd-admin-role-avatar pd-admin-role-${tone}`}
        sizeClassName="pd-admin-recent-avatar"
      />
      <span className="pd-admin-recent-user-copy">
        <span className="pd-admin-recent-user-top">
          <strong className="pd-admin-recent-user-name">{user.name}</strong>
          <span className="pd-admin-recent-user-time">{user.registeredLabel}</span>
        </span>
        <span className="pd-admin-recent-user-role">{user.role}</span>
      </span>
    </li>
  );
}

function LoadingRows() {
  return (
    <ul className="pd-admin-recent-users-list" aria-label="Recent users loading">
      {[0, 1, 2].map((index) => (
        <li key={index} className="pd-admin-recent-user-row pd-admin-recent-user-row-loading">
          <span className="pd-admin-recent-avatar pd-inline-loading" aria-hidden="true" />
          <span className="pd-admin-recent-user-copy">
            <span className="pd-inline-loading">Loading user...</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminRecentUsers({
  users = [],
  isLoading = false,
  onSeeAll,
}) {
  return (
    <section className="pd-card pd-card-pad pd-admin-side-card pd-admin-recent-users" aria-label="Recent users">
      <div className="pd-admin-section-header">
        <h2 className="pd-section-title">Recent Users</h2>
        <button type="button" className="pd-link-btn" onClick={onSeeAll}>
          See all
        </button>
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : users.length === 0 ? (
        <p className="pd-admin-empty-copy">No recent users.</p>
      ) : (
        <ul className="pd-admin-recent-users-list">
          {users.map((user) => (
            <RecentUserRow key={user.id || user.name} user={user} />
          ))}
        </ul>
      )}
    </section>
  );
}
