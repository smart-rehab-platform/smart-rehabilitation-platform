import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  navItems,
  badges,
  activeId = "dashboard",
  navigationAriaLabel = "Navigation",
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
  signOutLabel = "Sign Out",
}) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="pd-overlay"
          aria-label="Close navigation menu"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={`pd-sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}
        aria-label={navigationAriaLabel}
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
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapse}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="pd-sidebar-nav">
          {navItems.map((item) => {
            const badge = item.badgeKey ? badges[item.badgeKey] : null;
            const isActive = item.id === activeId;

            const navLabel = badge && collapsed
              ? `${item.label}, ${badge} unread`
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
                  <span className="pd-nav-badge" aria-label={`${badge} unread`}>
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
            aria-label="Sign out"
            onClick={onSignOut}
            title={collapsed ? signOutLabel : undefined}
          >
            {signOutIcon}
            {!collapsed ? <span>{signOutLabel}</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
