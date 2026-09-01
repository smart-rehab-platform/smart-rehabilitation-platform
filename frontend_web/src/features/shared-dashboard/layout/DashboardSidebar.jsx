import { useCallback } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { useDashboardDrawerChrome } from "../hooks/useDashboardDrawerChrome.js";

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  navItems,
  badges,
  activeId = "dashboard",
  navigationAriaLabel,
  logoSrc,
  brandTitle,
  brandSubtitle,
  onToggleCollapse,
  onCloseMobile,
  onNavAction,
  onSignOut,
  renderNavIcon,
  supportSlot = null,
  signOutIcon,
  signOutLabel,
}) {
  const { t, isRtl } = useLocale();
  const resolvedNavigationLabel = navigationAriaLabel ?? t("common.navigation");
  const resolvedSignOutLabel = signOutLabel ?? t("profile.signOut");
  const CollapseIcon = collapsed
    ? (isRtl ? PanelRightOpen : PanelLeftOpen)
    : (isRtl ? PanelRightClose : PanelLeftClose);

  const closeMobileNav = useCallback(() => {
    onCloseMobile?.();
  }, [onCloseMobile]);

  // Keep drawer chrome consistent for Admin / Specialist / Parent shells.
  useDashboardDrawerChrome(Boolean(mobileOpen), closeMobileNav);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="pd-overlay"
          aria-label={t("header.closeNavigationMenu")}
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={`pd-sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}
        aria-label={resolvedNavigationLabel}
      >
        <div className="pd-sidebar-top">
          <div className="pd-brand">
            <span className="pd-brand-mark" aria-hidden="true">
              <img
                src={logoSrc}
                alt=""
                className="pd-brand-mark-img"
              />
            </span>
            {!collapsed ? (
              <span className="pd-brand-text">
                <strong>{brandTitle}</strong>
                <small>{brandSubtitle}</small>
              </span>
            ) : null}
          </div>

          <button
            type="button"
            className="pd-sidebar-collapse"
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            onClick={onToggleCollapse}
          >
            <CollapseIcon size={18} />
          </button>
        </div>

        <nav className="pd-sidebar-nav">
          {navItems.map((item) => {
            const badge = item.badgeKey ? badges[item.badgeKey] : null;
            const isActive = item.id === activeId;

            const navLabel = badge && collapsed
              ? `${item.label}, ${t("sidebar.unreadBadgeAriaLabel", { count: badge })}`
              : item.label;

            return (
              <button
                key={item.id}
                type="button"
                className={`pd-nav-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={navLabel}
                title={collapsed ? item.label : undefined}
                onClick={() => onNavAction?.(item.id)}
              >
                {renderNavIcon?.(item)}
                {!collapsed ? <span>{item.label}</span> : null}
                {!collapsed && badge ? (
                  <span
                    className="pd-nav-badge"
                    aria-label={t("sidebar.unreadBadgeAriaLabel", { count: badge })}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="pd-sidebar-bottom">
          {!collapsed ? supportSlot : null}

          <button
            type="button"
            className="pd-nav-item pd-signout"
            aria-label={t("sidebar.signOutAriaLabel")}
            onClick={onSignOut}
            title={collapsed ? resolvedSignOutLabel : undefined}
          >
            {signOutIcon}
            {!collapsed ? <span>{resolvedSignOutLabel}</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
