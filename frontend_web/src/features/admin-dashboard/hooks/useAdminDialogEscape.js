import { useEffect } from "react";

/**
 * Closes an Admin dialog on Escape.
 * Skips while `disabled` (e.g. submit in progress).
 */
export function useAdminDialogEscape(enabled, onClose, { disabled = false } = {}) {
  useEffect(() => {
    if (!enabled || disabled || typeof onClose !== "function") {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, disabled, onClose]);
}
