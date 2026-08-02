import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { C, G } from "./tokens";
import { resolveUploadUrl } from "./authHelpers";

export function ProfilePhotoUpload({
  displayUrl,
  fallbackUrl,
  previewUrl,
  imageUrl,
  uploading = false,
  onSelect,
}) {
  const fileInputRef = useRef(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [activeUrl, setActiveUrl] = useState(null);

  const resolvedDisplayUrl =
    displayUrl ?? previewUrl ?? resolveUploadUrl(imageUrl) ?? null;

  useEffect(() => {
    setActiveUrl(resolvedDisplayUrl);
    setImageBroken(false);
  }, [resolvedDisplayUrl]);

  const hasImage = Boolean(activeUrl) && !imageBroken;

  const handleImageError = () => {
    if (fallbackUrl && activeUrl !== fallbackUrl) {
      setActiveUrl(fallbackUrl);
      return;
    }

    setImageBroken(true);
  };

  const openFilePicker = () => {
    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleKeyDown = (event) => {
    if (uploading) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div className="profile-photo-upload flex flex-col items-center">
      <p
        className="profile-photo-upload-label mb-2 text-[13px] font-semibold leading-none"
        style={{ color: "#0F2342", fontFamily: "'Inter', sans-serif" }}
      >
        Profile Photo
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(event) => {
          onSelect(event);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        disabled={uploading}
        aria-label="Upload profile photo"
        className={`profile-photo-upload-trigger group relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-[225ms] focus-visible:outline-none disabled:cursor-not-allowed ${
          hasImage
            ? "profile-photo-upload-trigger--filled border-transparent"
            : "profile-photo-upload-trigger--empty border-dashed"
        }`}
        style={{
          borderColor: hasImage ? "transparent" : "rgba(79, 166, 248, 0.42)",
          background: hasImage ? "transparent" : G.hoverBg,
        }}
      >
        {hasImage ? (
          <img
            src={activeUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <Camera
            size={22}
            strokeWidth={1.75}
            className="profile-photo-upload-icon transition-all duration-[225ms]"
            style={{ color: C.iconInteractive, opacity: 0.82 }}
          />
        )}

        {hasImage && !uploading && (
          <span
            className="profile-photo-upload-overlay absolute inset-0 flex flex-col items-center justify-center rounded-full opacity-0 transition-opacity duration-[225ms] group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden
          >
            <Camera size={18} color="#FFFFFF" strokeWidth={2} />
            <span className="mt-1 text-[10px] font-semibold text-white">Change Photo</span>
          </span>
        )}

        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/72">
            <Loader2 size={22} className="animate-spin" style={{ color: C.primary }} />
          </span>
        )}
      </button>

      {!hasImage && (
        <p
          className="profile-photo-upload-hint mt-1.5 text-[11px] font-medium leading-none"
          style={{ color: "#5A7390", fontFamily: "'Inter', sans-serif" }}
        >
          {uploading ? "Uploading..." : "Click to upload"}
        </p>
      )}

      {hasImage && uploading && (
        <p
          className="profile-photo-upload-hint mt-1.5 text-[11px] font-medium leading-none"
          style={{ color: "#5A7390", fontFamily: "'Inter', sans-serif" }}
        >
          Uploading...
        </p>
      )}

      <style>{`
        .profile-photo-upload-trigger--empty:not(:disabled):hover,
        .profile-photo-upload-trigger--empty:not(:disabled):focus-visible {
          transform: scale(1.03);
          border-color: ${C.primary} !important;
          background: rgba(79, 166, 248, 0.12) !important;
          box-shadow: 0 0 0 3px rgba(79, 166, 248, 0.14);
        }

        .profile-photo-upload-trigger--empty:not(:disabled):hover .profile-photo-upload-icon,
        .profile-photo-upload-trigger--empty:not(:disabled):focus-visible .profile-photo-upload-icon {
          opacity: 1 !important;
          color: ${C.primary} !important;
        }

        .profile-photo-upload-trigger--filled:not(:disabled):hover,
        .profile-photo-upload-trigger--filled:not(:disabled):focus-visible {
          box-shadow: 0 0 0 3px rgba(79, 166, 248, 0.14);
        }

        .profile-photo-upload-overlay {
          background: rgba(15, 35, 66, 0.42);
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-photo-upload-trigger,
          .profile-photo-upload-icon,
          .profile-photo-upload-overlay {
            transition: none !important;
          }

          .profile-photo-upload-trigger--empty:not(:disabled):hover,
          .profile-photo-upload-trigger--empty:not(:disabled):focus-visible {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
