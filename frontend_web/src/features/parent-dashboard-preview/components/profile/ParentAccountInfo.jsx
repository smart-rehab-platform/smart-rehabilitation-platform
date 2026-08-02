export function ParentAccountInfo({ profile }) {
  return (
    <section className="pd-card pd-card-pad pd-profile-account pd-section-enter" aria-label="Account information">
      <header className="pd-profile-section-head">
        <h2 className="pd-section-title">Account Information</h2>
        <p className="pd-task-hub-subtitle">Read-only account details.</p>
      </header>

      <dl className="pd-profile-account-list">
        <div className="pd-profile-account-item">
          <dt>Email</dt>
          <dd>{profile?.email || "—"}</dd>
        </div>
        <div className="pd-profile-account-item">
          <dt>Role</dt>
          <dd>{profile?.roleLabel || "Parent"}</dd>
        </div>
        <div className="pd-profile-account-item">
          <dt>Email status</dt>
          <dd>{profile?.isEmailVerified ? "Verified" : "Not verified"}</dd>
        </div>
        {profile?.memberSince ? (
          <div className="pd-profile-account-item">
            <dt>Member since</dt>
            <dd>{profile.memberSince}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
