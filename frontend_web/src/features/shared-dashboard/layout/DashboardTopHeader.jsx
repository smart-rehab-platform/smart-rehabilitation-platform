import { Menu, Search } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";

export function DashboardTopHeader({
  onOpenMobileNav,
  searchPlaceholder,
  searchAriaLabel,
  searchContent = null,
  onMessages,
  messagesBadge = null,
  notificationPopover,
  profileMenu,
}) {
  const { t } = useLocale();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("header.searchPlaceholder");
  const resolvedSearchAriaLabel = searchAriaLabel ?? t("header.searchAriaLabel");
  const messagesAriaLabel = messagesBadge
    ? t("header.messagesUnreadAriaLabel", { count: messagesBadge })
    : t("header.messagesAriaLabel");

  return (
    <header className="pd-top-header">
      <button
        type="button"
        className="pd-mobile-menu"
        aria-label={t("header.openNavigationMenu")}
        onClick={onOpenMobileNav}
      >
        <Menu size={20} />
      </button>

      {searchContent ? (
        searchContent
      ) : (
        <label className="pd-search">
          <Search size={16} aria-hidden="true" />
          <span className="pd-sr-only">{t("common.search")}</span>
          <input
            type="search"
            placeholder={resolvedSearchPlaceholder}
            aria-label={resolvedSearchAriaLabel}
          />
        </label>
      )}

      <div className="pd-header-actions">
        {typeof onMessages === "function" ? (
          <button
            type="button"
            className="pd-icon-btn"
            aria-label={messagesAriaLabel}
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
