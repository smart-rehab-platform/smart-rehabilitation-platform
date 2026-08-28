import { useMemo } from "react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminRecentUsersLabels } from "../utils/adminDashboardLocalization.js";
import { getAdminRoleTone, getAvatarInitial } from "../utils/adminDashboardMappers";

function RecentUserRow({ user }) {
  const tone = getAdminRoleTone(user.rawRole);
  const initials = getAvatarInitial(user.name);

  return (
    <li className="pd-admin-recent-user-row">
      <UserProfileAvatar
        imageUrl={user.profileImageUrl}
        initials={initials}
        alt=""
        shellClassName={`pd-avatar pd-admin-role-avatar pd-admin-role-${tone}`}
        fallbackClassName={`pd-avatar pd-admin-role-avatar pd-admin-role-${tone}`}
        sizeClassName="pd-admin-recent-avatar"
        className="pd-avatar-photo"
      />
      <span className="pd-admin-recent-user-copy">
        <span className="pd-admin-recent-user-top">
          <strong className="pd-admin-recent-user-name" dir="auto">{user.name}</strong>
          <span className="pd-admin-recent-user-time">{user.registeredLabel}</span>
        </span>
        <span className="pd-admin-recent-user-role">{user.role}</span>
      </span>
    </li>
  );
}

function LoadingRows({ loadingUserLabel, listAriaLabel }) {
  return (
    <ul className="pd-admin-recent-users-list" aria-label={listAriaLabel}>
      {[0, 1, 2].map((index) => (
        <li key={index} className="pd-admin-recent-user-row pd-admin-recent-user-row-loading">
          <span className="pd-admin-recent-avatar pd-inline-loading" aria-hidden="true" />
          <span className="pd-admin-recent-user-copy">
            <span className="pd-inline-loading">{loadingUserLabel}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminRecentUsers({
  users = [],
  isLoading = false,
  sectionId,
  highlighted = false,
  onSeeAll,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminRecentUsersLabels(t), [t]);

  return (
    <section
      id={sectionId}
      className={`pd-card pd-card-pad pd-admin-side-card pd-admin-recent-users${highlighted ? " is-scroll-target-highlight" : ""}`}
      aria-label={labels.sectionAriaLabel}
    >
      <div className="pd-admin-section-header">
        <h2 className="pd-section-title">{labels.title}</h2>
        <button type="button" className="pd-link-btn" onClick={onSeeAll}>
          {labels.seeAll}
        </button>
      </div>

      {isLoading ? (
        <LoadingRows
          loadingUserLabel={labels.loadingUser}
          listAriaLabel={labels.loadingListAriaLabel}
        />
      ) : users.length === 0 ? (
        <p className="pd-admin-empty-copy">{labels.empty}</p>
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
