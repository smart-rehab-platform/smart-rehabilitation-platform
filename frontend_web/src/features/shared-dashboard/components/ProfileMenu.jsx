import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { LanguageSelector } from "../../../components/localization/LanguageSelector.jsx";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
import { getRoleDisplayLabel } from "../utils/profileDisplayUtils.js";
import { UserProfileAvatar } from "./UserProfileAvatar";

export function ProfileMenu({ user, onViewProfile, onSignOut }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const roleLabel = getRoleDisplayLabel(user?.role, t);

  useEffect(() => {
    if (!open) return undefined;

    const onOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("click", onOutsideClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onOutsideClick);
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
          alt={t("profile.photoAlt", { name: user.fullName })}
          shellClassName="pd-avatar"
          fallbackClassName="pd-avatar"
          className="pd-avatar-photo"
        />
        <span className="pd-profile-copy">
          <strong dir="auto">{user.fullName}</strong>
          <small dir="auto">{roleLabel}</small>
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
            {t("profile.viewProfile")}
          </button>

          <LanguageSelector
            variant="profileMenu"
            onSelected={() => setOpen(false)}
          />

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
            {t("profile.signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
