import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { UserProfileAvatar } from "./UserProfileAvatar";

export function ProfileMenu({ user, onViewProfile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="pd-profile-menu" ref={rootRef}>
      <button
        type="button"
        className="pd-profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserProfileAvatar
          imageUrl={user.profileImageUrl}
          initials={user.initials}
          alt={`${user.fullName} profile photo`}
          shellClassName="pd-avatar"
          fallbackClassName="pd-avatar"
          className="pd-avatar-photo"
        />
        <span className="pd-profile-copy">
          <strong>{user.fullName}</strong>
          <small>{user.role}</small>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div id={menuId} className="pd-dropdown pd-profile-dropdown" role="menu">
          <button
            type="button"
            className="pd-dropdown-item"
            role="menuitem"
            onClick={() => {
              onViewProfile?.();
              setOpen(false);
            }}
          >
            <PlatformMaterialIcon icon="profile" size={16} />
            View profile
          </button>
          <button
            type="button"
            className="pd-dropdown-item"
            role="menuitem"
            onClick={() => {
              onSignOut?.();
              setOpen(false);
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
