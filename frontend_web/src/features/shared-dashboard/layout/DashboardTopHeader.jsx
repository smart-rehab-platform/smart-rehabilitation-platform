import { Menu, Search } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

export function DashboardTopHeader({
  onOpenMobileNav,
  searchPlaceholder = "Search exercises, reports, sessions...",
  searchAriaLabel = "Search exercises, reports, sessions",
  searchContent = null,
  onMessages,
  messagesBadge = null,
  notificationPopover,
  profileMenu,
}) {
  return (
    <header className="pd-top-header">
      <button
        type="button"
        className="pd-mobile-menu"
        aria-label="Open navigation menu"
        onClick={onOpenMobileNav}
      >
        <Menu size={20} />
      </button>

      {searchContent ? (
        searchContent
      ) : (
        <label className="pd-search">
          <Search size={16} aria-hidden="true" />
          <span className="pd-sr-only">Search</span>
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
          />
        </label>
      )}

      <div className="pd-header-actions">
        {typeof onMessages === "function" ? (
          <button
            type="button"
            className="pd-icon-btn"
            aria-label={`Messages${messagesBadge ? `, ${messagesBadge} unread` : ""}`}
            onClick={onMessages}
          >
            <PlatformMaterialIcon icon="messageSquare" size={18} />
            {messagesBadge ? (
              <span className="pd-icon-badge" aria-hidden="true">
                {messagesBadge}
              </span>
            ) : null}
          </button>
        ) : null}

        {notificationPopover}
        {profileMenu}
      </div>
    </header>
  );
}
