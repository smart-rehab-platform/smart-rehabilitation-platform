import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  UserX,
} from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { AdminTablePrimaryAction } from "./AdminTablePrimaryAction";

function getPortalRoot() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.querySelector(".pd-preview");
}

function getDropdownPosition(triggerEl, isRtl) {
  const rect = triggerEl.getBoundingClientRect();
  const minWidth = 220;

  if (isRtl) {
    return {
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
      minWidth: Math.max(rect.width + 40, minWidth),
    };
  }

  return {
    top: rect.bottom + 6,
    left: rect.left,
    minWidth: Math.max(rect.width + 40, minWidth),
  };
}

function closeMenu(setOpen) {
  setOpen(false);
}

export function AdminUserActionsMenu({
  user,
  labels,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const { isRtl } = useLocale();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const menuId = useId();

  const userName = user.fullName || labels.emptyDisplay;

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setDropdownStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      setDropdownStyle(getDropdownPosition(triggerRef.current, isRtl));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isRtl, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onPointerDown = (event) => {
      const target = event.target;
      if (
        rootRef.current?.contains(target)
        || dropdownRef.current?.contains(target)
      ) {
        return;
      }

      closeMenu(setOpen);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu(setOpen);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const runAction = (handler) => {
    closeMenu(setOpen);
    handler(user);
  };

  const dropdown = open && dropdownStyle ? (
    <div
      id={menuId}
      ref={dropdownRef}
      className="pd-dropdown pd-admin-users-actions-dropdown"
      role="menu"
      aria-label={labels.actionAria.menuTrigger(userName)}
      style={dropdownStyle}
    >
      <button
        type="button"
        className="pd-dropdown-item pd-admin-users-menu-item"
        role="menuitem"
        onClick={() => runAction(onEdit)}
      >
        <Pencil size={15} aria-hidden="true" />
        <span>{labels.menu.editUser}</span>
      </button>
      <button
        type="button"
        className={`pd-dropdown-item pd-admin-users-menu-item${user.isActive ? " is-deactivate" : " is-activate"}`}
        role="menuitem"
        onClick={() => runAction(onToggleStatus)}
      >
        {user.isActive ? (
          <UserX size={15} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={15} aria-hidden="true" />
        )}
        <span>
          {user.isActive ? labels.menu.deactivateUser : labels.menu.activateUser}
        </span>
      </button>
      <button
        type="button"
        className="pd-dropdown-item pd-admin-users-menu-item is-delete"
        role="menuitem"
        onClick={() => runAction(onDelete)}
      >
        <Trash2 size={15} aria-hidden="true" />
        <span>{labels.menu.deleteUser}</span>
      </button>
    </div>
  ) : null;

  return (
    <div className="pd-admin-users-actions" ref={rootRef}>
      <AdminTablePrimaryAction
        onClick={() => onEdit(user)}
        aria-label={labels.actionAria.manage(userName)}
      >
        {labels.manage}
      </AdminTablePrimaryAction>

      <button
        ref={triggerRef}
        type="button"
        className="pd-admin-users-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={labels.actionAria.menuTrigger(userName)}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical size={16} aria-hidden="true" />
      </button>

      {dropdown && getPortalRoot()
        ? createPortal(dropdown, getPortalRoot())
        : null}
    </div>
  );
}
