import { useState } from "react";
import { getCaseRequestChildInitials } from "../../utils/parentCaseRequestImageUtils";

function CaseRequestChildAvatarInner({
  childName,
  imageUrl,
  size = "md",
}) {
  const [broken, setBroken] = useState(false);
  const initials = getCaseRequestChildInitials(childName);
  const altText = childName ? `${childName} photo` : "Child photo";
  const className = `pd-case-child-avatar pd-case-child-avatar-${size}`;

  if (imageUrl && !broken) {
    return (
      <img
        src={imageUrl}
        alt={altText}
        className={`${className} pd-avatar-photo`}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className={`${className} pd-avatar`} aria-hidden="true">
      {initials}
    </span>
  );
}

export function CaseRequestChildAvatar(props) {
  return (
    <CaseRequestChildAvatarInner
      key={props.imageUrl || "fallback"}
      {...props}
    />
  );
}
