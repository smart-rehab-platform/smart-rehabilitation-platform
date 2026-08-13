export function AdminProfileAccountSection({ onLogout }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-profile-account pd-section-enter" aria-label="Account">
      <div className="pd-admin-profile-account-copy">
        <h2 className="pd-admin-profile-account-title">Account</h2>
        <p className="pd-admin-profile-account-sub">
          Sign out of your Smart Rehabilitation Platform account.
        </p>
      </div>

      <button type="button" className="pd-btn pd-btn-soft pd-admin-profile-logout" onClick={onLogout}>
        Logout
      </button>
    </section>
  );
}
