import { UserProfileAvatar } from "./UserProfileAvatar";

export function ParentProfileSummaryCard({ profile }) {
  return (
    <section className="pd-card pd-card-pad pd-profile-summary pd-section-enter" aria-label="Profile summary">
      <div className="pd-profile-summary-main">
        <UserProfileAvatar
          imageUrl={profile?.profileImageUrl}
          initials={profile?.initials || "P"}
          alt={`${profile?.fullName || "Parent"} profile photo`}
          shellClassName="pd-avatar pd-profile-summary-photo"
          fallbackClassName="pd-avatar pd-avatar-lg"
          className="pd-avatar-photo"
        />
        <div>
          <h2 className="pd-profile-summary-name">{profile?.fullName || "Parent"}</h2>
          <p className="pd-profile-summary-meta">{profile?.email || "—"}</p>
          <p className="pd-profile-summary-meta">{profile?.roleLabel || "Parent"}</p>
        </div>
      </div>
    </section>
  );
}
