import { LogOut } from "lucide-react";
import smartRehabIcon from "../../../assets/branding/smart_rehab_icon.png";
import { DashboardSidebar } from "../../shared-dashboard/layout/DashboardSidebar";
import { ParentNavIcon } from "../components/ParentNavIcon";

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
    <DashboardSidebar
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      navItems={navItems}
      badges={badges}
      activeId={activeId}
      navigationAriaLabel="Parent navigation"
      logoSrc={smartRehabIcon}
      brandTitle="Smart Rehabilitation"
      brandSubtitle="Where Recovery Never Stops"
      onToggleCollapse={onToggleCollapse}
      onCloseMobile={onCloseMobile}
      onNavAction={onNavAction}
      onSignOut={onSignOut}
      renderNavIcon={(item) => (
        <ParentNavIcon navId={item.id} iconKey={item.icon} size={18} />
      )}
      supportSlot={
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
      }
      signOutIcon={<LogOut size={18} aria-hidden="true" />}
      signOutLabel="Sign Out"
    />
  );
}
