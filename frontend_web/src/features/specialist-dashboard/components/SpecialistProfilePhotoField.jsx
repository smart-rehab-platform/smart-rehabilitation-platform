import { useRef } from "react";
import { Camera } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistProfilePhotoField({
  fullName,
  imageUrl,
  previewUrl,
  disabled = false,
  onSelectFile,
}) {
  const inputRef = useRef(null);
  const name = fullName || "Specialist";
  const displayUrl = previewUrl || imageUrl || null;

  const handleChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) {
      return;
    }
    onSelectFile(file);
  };

  return (
    <section className="pd-card pd-card-pad pd-specialist-profile-photo-card">
      <h2 className="pd-specialist-profile-section-title">Profile Photo</h2>
      <div className="pd-specialist-profile-photo-row">
        <UserProfileAvatar
          imageUrl={displayUrl}
          initials={getInitials(name, "SP")}
          alt={`${name} profile photo`}
          shellClassName="pd-avatar pd-specialist-profile-avatar"
          fallbackClassName="pd-avatar pd-specialist-profile-avatar"
          className="pd-avatar-photo"
        />
        <div className="pd-specialist-profile-photo-actions">
          <input
            ref={inputRef}
            id="specialist-profile-photo-input"
            type="file"
            accept="image/*"
            className="pd-specialist-profile-file-input"
            disabled={disabled}
            onChange={handleChange}
          />
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            Change photo
          </button>
          <p className="pd-section-sub">Choose a new photo. It will upload when you save changes.</p>
        </div>
      </div>
    </section>
  );
}
