import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { UserProfileAvatar } from "./profile/UserProfileAvatar";

function getPortalRoot() {
  if (typeof document === "undefined") return null;
  return document.querySelector(".pd-preview");
}

function getDropdownPosition(triggerEl) {
  const rect = triggerEl.getBoundingClientRect();
  return {
    top: rect.bottom + 6,
    left: rect.left,
    minWidth: Math.max(rect.width, 200),
  };
}

export function ChildSelector({ items, selectedChildId, isLoading = false, onSelect }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const listId = useId();
  const selected = items.find((c) => c.id === selectedChildId) || items[0];
  const isDisabled = isLoading || items.length === 0;
  const effectiveOpen = open && !isDisabled;

  useLayoutEffect(() => {
    if (!effectiveOpen || !triggerRef.current) {
      setDropdownStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;
      setDropdownStyle(getDropdownPosition(triggerRef.current));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [effectiveOpen]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (
        rootRef.current?.contains(target)
        || dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
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

  const dropdown = effectiveOpen && dropdownStyle ? (
    <ul
      id={listId}
      ref={dropdownRef}
      className="pd-dropdown pd-child-selector-dropdown"
      role="listbox"
      aria-label={t("parent.home.selectChildAriaLabel")}
      style={dropdownStyle}
    >
      {items.map((child) => (
        <li key={child.id} role="option" aria-selected={child.id === selectedChildId}>
          <button
            type="button"
            className={`pd-dropdown-item${child.id === selectedChildId ? " is-active" : ""}`}
            onClick={() => {
              onSelect(child.id);
              setOpen(false);
            }}
          >
            <UserProfileAvatar
              imageUrl={child.profileImageUrl}
              initials={child.initials}
              alt=""
              shellClassName="pd-avatar pd-avatar-sm"
              fallbackClassName="pd-avatar pd-avatar-sm"
              className="pd-avatar-photo"
            />
            <span>
              <strong>{child.fullName}</strong>
              <small>{child.status}</small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div className="pd-child-selector" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="pd-child-trigger"
        aria-haspopup="listbox"
        aria-expanded={effectiveOpen}
        aria-controls={listId}
        disabled={isDisabled}
        onClick={() => setOpen((value) => !value)}
      >
        <UserProfileAvatar
          imageUrl={selected?.profileImageUrl}
          initials={isLoading ? "…" : selected?.initials || "?"}
          alt=""
          shellClassName="pd-avatar pd-avatar-sm"
          fallbackClassName="pd-avatar pd-avatar-sm"
          className="pd-avatar-photo"
        />
        <span className="pd-child-copy">
          <strong>
            {isLoading ? t("parent.home.loadingChildren") : selected?.fullName || t("parent.home.noChildren")}
          </strong>
          <small>{isLoading ? t("parent.home.pleaseWait") : selected?.status || "—"}</small>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {dropdown && getPortalRoot()
        ? createPortal(dropdown, getPortalRoot())
        : null}
    </div>
  );
}
