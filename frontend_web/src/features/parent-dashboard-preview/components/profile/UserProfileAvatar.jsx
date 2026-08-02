import { useState } from "react";

function UserProfileAvatarInner({
  imageUrl,
  initials = "P",
  alt = "Profile photo",
  className = "pd-avatar-photo",
  fallbackClassName = "pd-avatar",
  sizeClassName = "",
  shellClassName = "",
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(imageUrl) && !broken;
  const resolvedShellClassName = shellClassName || fallbackClassName;
  const shellClasses = showImage
    ? [resolvedShellClassName, sizeClassName, "pd-avatar-shell"].filter(Boolean).join(" ")
    : [fallbackClassName, sizeClassName].filter(Boolean).join(" ");

  if (showImage) {
    return (
      <span className={shellClasses} aria-hidden={alt ? undefined : true}>
        <img
          src={imageUrl}
          alt={alt}
          className={className}
          onError={() => setBroken(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={[fallbackClassName, sizeClassName].filter(Boolean).join(" ")}
      aria-hidden={alt ? undefined : true}
    >
      {initials}
    </span>
  );
}

/**
 * Shared profile photo with initials fallback and broken-image protection.
 */
export function UserProfileAvatar(props) {
  return (
    <UserProfileAvatarInner
      key={props.imageUrl || "fallback"}
      {...props}
    />
  );
}
