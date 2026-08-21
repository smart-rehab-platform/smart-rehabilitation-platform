import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  MoreVertical,
  Pencil,
  UserX,
  XCircle,
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

export function AdminSessionActionsMenu({
  session,
  labels,
  onEditSession,
  onCompleteSession,
  onCancelSession,
  onNoShowSession,
}) {
  const { isRtl } = useLocale();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const menuId = useId();

  const patientName = session.patientName || labels.emptyDisplay;
  const hasSecondaryActions = session.isScheduled;
  const primaryLabel = hasSecondaryActions ? labels.manage : labels.view;
  const primaryAriaLabel = hasSecondaryActions
    ? labels.actionAria.manage(patientName)
    : labels.actionAria.view(patientName);

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
    handler(session);
  };

  const dropdown = open && dropdownStyle ? (
    <div
      id={menuId}
      ref={dropdownRef}
      className="pd-dropdown pd-admin-sessions-actions-dropdown"
      role="menu"
      aria-label={labels.actionAria.menuTrigger(patientName)}
      style={dropdownStyle}
    >
      <button
        type="button"
        className="pd-dropdown-item pd-admin-sessions-menu-item"
        role="menuitem"
        onClick={() => runAction(onEditSession)}
      >
        <Pencil size={15} aria-hidden="true" />
        <span>{labels.menu.editSession}</span>
      </button>
      <button
        type="button"
        className="pd-dropdown-item pd-admin-sessions-menu-item is-complete"
        role="menuitem"
        onClick={() => runAction(onCompleteSession)}
      >
        <CheckCircle2 size={15} aria-hidden="true" />
        <span>{labels.menu.completeSession}</span>
      </button>
      <button
        type="button"
        className="pd-dropdown-item pd-admin-sessions-menu-item is-cancel"
        role="menuitem"
        onClick={() => runAction(onCancelSession)}
      >
        <XCircle size={15} aria-hidden="true" />
        <span>{labels.menu.cancelSession}</span>
      </button>
      <button
        type="button"
        className="pd-dropdown-item pd-admin-sessions-menu-item is-no-show"
        role="menuitem"
        onClick={() => runAction(onNoShowSession)}
      >
        <UserX size={15} aria-hidden="true" />
        <span>{labels.menu.markNoShow}</span>
      </button>
    </div>
  ) : null;

  return (
    <div className="pd-admin-sessions-actions" ref={rootRef}>
      <AdminTablePrimaryAction
        onClick={() => onEditSession(session)}
        aria-label={primaryAriaLabel}
      >
        {primaryLabel}
      </AdminTablePrimaryAction>

      {hasSecondaryActions ? (
        <button
          ref={triggerRef}
          type="button"
          className="pd-admin-sessions-menu-trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={labels.actionAria.menuTrigger(patientName)}
          onClick={() => setOpen((value) => !value)}
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>
      ) : null}

      {dropdown && getPortalRoot()
        ? createPortal(dropdown, getPortalRoot())
        : null}
    </div>
  );
}
