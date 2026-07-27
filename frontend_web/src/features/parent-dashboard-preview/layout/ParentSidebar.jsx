import { BRAND_ASSETS } from "../../../styles/brandTokens";
import {
  Activity,
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

const ICONS = {
  layoutDashboard: LayoutDashboard,
  users: Users,
  clipboardList: ClipboardList,
  activity: Activity,
  trendingUp: TrendingUp,
  calendar: Calendar,
  fileText: FileText,
  messageCircle: MessageCircle,
  messageSquare: MessageSquare,
  sparkles: Sparkles,
  bell: Bell,
  user: User,
};

export function ParentSidebar({
  collapsed,
  mobileOpen,
  navItems,
  badges,
  activeId = "dashboard",
  onToggleCollapse,
  onCloseMobile,
  onNavAction,
  onSignOut,
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
        aria-label="Parent navigation"
      >
        <div className="pd-sidebar-top">
          <div className="pd-brand">
            <span className="pd-brand-mark" aria-hidden="true">
              <img
                src={BRAND_ASSETS.icon}
                alt=""
                className="pd-brand-mark-img"
              />
            </span>
            {!collapsed ? (
              <span className="pd-brand-text">
                <strong>Smart Rehabilitation</strong>
                <small>Where Recovery Never Stops</small>
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
            const Icon = ICONS[item.icon] || LayoutDashboard;
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
                <Icon size={18} aria-hidden="true" />
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
          {!collapsed ? (
            <div className="pd-help-card">
              <strong>Help & Support</strong>
              <p>Questions about exercises or sessions?</p>
              <button
                type="button"
                className="pd-link"
                onClick={() => onNavAction("Contact Support (preview only)")}
              >
                Contact Support →
              </button>
            </div>
          ) : null}

          <button
            type="button"
            className="pd-nav-item pd-signout"
            aria-label="Sign out"
            onClick={onSignOut}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={18} aria-hidden="true" />
            {!collapsed ? <span>Sign Out</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
