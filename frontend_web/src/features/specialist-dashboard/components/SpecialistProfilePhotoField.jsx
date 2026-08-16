import { useMemo, useRef } from "react";
import { Camera } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getSpecialistProfilePageLabels } from "../utils/specialistProfileLocalization.js";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistProfilePhotoField({
  fullName,
  imageUrl,
  previewUrl,
  disabled = false,
  onSelectFile,
}) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistProfilePageLabels(t), [t]);
  const inputRef = useRef(null);
  const name = fullName || pageLabels.title;
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
      <h2 className="pd-specialist-profile-section-title">{pageLabels.profilePhoto}</h2>
      <div className="pd-specialist-profile-photo-row">
        <UserProfileAvatar
          imageUrl={displayUrl}
          initials={getInitials(name, "SP")}
          alt={pageLabels.profilePhotoAlt(name)}
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
            {pageLabels.changePhoto}
          </button>
          <p className="pd-section-sub">{pageLabels.photoHint}</p>
        </div>
      </div>
    </section>
  );
}
