import { LogOut } from "lucide-react";
import smartRehabIcon from "../../../assets/branding/smart_rehab_icon.png";
import { useLocale } from "../../../context/useLocale.js";
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
  const { t } = useLocale();

  return (
    <DashboardSidebar
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      navItems={navItems}
      badges={badges}
      activeId={activeId}
      navigationAriaLabel={t("parent.brand.navigationAriaLabel")}
      logoSrc={smartRehabIcon}
      brandTitle={t("parent.brand.title")}
      brandSubtitle={t("parent.brand.subtitle")}
      onToggleCollapse={onToggleCollapse}
      onCloseMobile={onCloseMobile}
      onNavAction={onNavAction}
      onSignOut={onSignOut}
      renderNavIcon={(item) => (
        <ParentNavIcon navId={item.id} iconKey={item.icon} size={18} />
      )}
      signOutIcon={<LogOut size={18} aria-hidden="true" />}
      signOutLabel={t("profile.signOut")}
    />
  );
}
