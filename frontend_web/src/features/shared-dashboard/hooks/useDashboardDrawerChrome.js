import { useEffect } from "react";
import { DASHBOARD_DRAWER_BREAKPOINT } from "../utils/dashboardLayoutConstants.js";

/**
 * Shared mobile-drawer chrome behavior for Admin / Specialist / Parent:
 * - lock body scroll while the drawer is open
 * - close the drawer when the viewport returns to desktop width
 *
 * @param {boolean} mobileNavOpen
 * @param {() => void} onCloseMobileNav
 */
export function useDashboardDrawerChrome(mobileNavOpen, onCloseMobileNav) {
  useEffect(() => {
    if (!mobileNavOpen) {
      return undefined;
    }

    document.body.classList.add("pd-preview-drawer-open");
    return () => {
      document.body.classList.remove("pd-preview-drawer-open");
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > DASHBOARD_DRAWER_BREAKPOINT) {
        onCloseMobileNav();
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onCloseMobileNav]);
}
