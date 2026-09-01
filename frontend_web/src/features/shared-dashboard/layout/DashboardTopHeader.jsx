import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
import { DASHBOARD_NARROW_HEADER_BREAKPOINT } from "../utils/dashboardLayoutConstants.js";

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

  const [isNarrowHeader, setIsNarrowHeader] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  useEffect(() => {
    const syncNarrowHeader = () => {
      const narrow = window.innerWidth <= DASHBOARD_NARROW_HEADER_BREAKPOINT;
      setIsNarrowHeader(narrow);
      if (!narrow) {
        setSearchExpanded(false);
      }
    };

    syncNarrowHeader();
    window.addEventListener("resize", syncNarrowHeader);
    return () => window.removeEventListener("resize", syncNarrowHeader);
  }, []);

  const showCollapsedSearchToggle = isNarrowHeader && !searchExpanded;
  const searchSlotClassName = [
    "pd-header-search-slot",
    isNarrowHeader && searchExpanded ? "is-expanded" : "",
    showCollapsedSearchToggle ? "is-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const defaultSearch = (
    <label className="pd-search">
      <Search size={16} aria-hidden="true" />
      <span className="pd-sr-only">{t("common.search")}</span>
      <input
        type="search"
        placeholder={resolvedSearchPlaceholder}
        aria-label={resolvedSearchAriaLabel}
      />
    </label>
  );

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

      <div className={searchSlotClassName}>
        {showCollapsedSearchToggle ? (
          <button
            type="button"
            className="pd-icon-btn pd-header-search-toggle"
            aria-label={t("header.openSearch")}
            aria-expanded={false}
            onClick={() => setSearchExpanded(true)}
          >
            <Search size={18} aria-hidden="true" />
          </button>
        ) : (
          <>
            {searchContent ?? defaultSearch}
            {isNarrowHeader && searchExpanded ? (
              <button
                type="button"
                className="pd-icon-btn pd-header-search-close"
                aria-label={t("header.closeSearch")}
                onClick={() => setSearchExpanded(false)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : null}
          </>
        )}
      </div>

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
