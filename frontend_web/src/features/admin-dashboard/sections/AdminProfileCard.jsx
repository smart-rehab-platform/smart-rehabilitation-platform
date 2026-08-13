import { AdminProfileAvatarEditor } from "../components/AdminProfileAvatarEditor";

function ProfileInfoRow({ label, value }) {
  return (
    <div className="pd-admin-profile-info-row">
      <span className="pd-admin-profile-info-label">{label}</span>
      <span className="pd-admin-profile-info-value">{value}</span>
    </div>
  );
}

export function AdminProfileCard({
  fullName,
  email,
  role,
  initials,
  imageUrl,
  isUploading,
  onSelectFile,
}) {
  return (
    <section className="pd-card pd-card-pad pd-admin-profile-card pd-section-enter" aria-label="Profile details">
      <div className="pd-admin-profile-card-grid">
        <AdminProfileAvatarEditor
          imageUrl={imageUrl}
          initials={initials}
          fullName={fullName === "—" ? "" : fullName}
          isUploading={isUploading}
          onSelectFile={onSelectFile}
        />

        <div className="pd-admin-profile-info">
          <ProfileInfoRow label="Full Name" value={fullName} />
          <ProfileInfoRow label="Email" value={email} />
          <div className="pd-admin-profile-info-row">
            <span className="pd-admin-profile-info-label">Role</span>
            <span className="pd-admin-profile-role-badge">{role}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
