import { useRef } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";

export function AdminProfileAvatarEditor({
  imageUrl,
  initials,
  fullName,
  isUploading = false,
  onSelectFile,
}) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (isUploading) {
      return;
    }
    inputRef.current?.click();
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (file) {
      onSelectFile?.(file);
    }
  };

  return (
    <div className="pd-admin-profile-avatar-editor">
      <div className="pd-admin-profile-avatar-wrap">
        <UserProfileAvatar
          imageUrl={imageUrl}
          initials={initials}
          alt={fullName ? `${fullName} profile photo` : "Profile photo"}
          fallbackClassName="pd-avatar pd-admin-profile-avatar"
          shellClassName="pd-avatar-shell pd-admin-profile-avatar-shell"
          className="pd-avatar-photo pd-admin-profile-avatar-photo"
        />

        {isUploading ? (
          <span className="pd-admin-profile-avatar-overlay" aria-live="polite">
            <LoaderCircle size={22} className="pd-admin-profile-spinner" aria-hidden="true" />
            <span className="pd-sr-only">Uploading profile photo</span>
          </span>
        ) : null}

        <button
          type="button"
          className="pd-admin-profile-camera-btn"
          onClick={openPicker}
          disabled={isUploading}
          aria-label="Change profile photo"
        >
          <Camera size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="pd-sr-only"
        onChange={handleChange}
        disabled={isUploading}
        aria-label="Choose profile photo"
      />

      <button
        type="button"
        className="pd-admin-profile-change-link"
        onClick={openPicker}
        disabled={isUploading}
      >
        Change profile photo
      </button>
    </div>
  );
}
