import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ADMIN_NAV_ITEMS } from "../constants/adminNavigation";
import {
  ADMIN_SIDEBAR_NAV_ROUTE_KEYS,
  getAdminRoutePath,
} from "../../../routes/adminDashboardRoutes";
import { AdminNavIcon } from "./AdminNavIcon";
import "../styles/adminHeaderSearch.css";

function buildAdminSearchDestinations() {
  return ADMIN_NAV_ITEMS.map((item) => {
    const routeKey = ADMIN_SIDEBAR_NAV_ROUTE_KEYS[item.id] ?? item.id;
    const route = getAdminRoutePath(routeKey);

    return {
      id: item.id,
      label: item.label,
      route,
      icon: item.icon,
    };
  }).filter((destination) => Boolean(destination.route));
}

const ADMIN_SEARCH_DESTINATIONS = buildAdminSearchDestinations();

function filterAdminSearchDestinations(query) {
  const normalized = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!normalized) {
    return [];
  }

  return ADMIN_SEARCH_DESTINATIONS.filter((destination) => (
    destination.label.toLowerCase().includes(normalized)
  ));
}

export function AdminHeaderSearch() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();
  const inputId = useId();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const results = useMemo(() => filterAdminSearchDestinations(query), [query]);
  const trimmedQuery = query.trim();
  const showPanel = open && trimmedQuery.length > 0;
  const safeHighlightedIndex = results.length === 0
    ? 0
    : Math.min(highlightedIndex, results.length - 1);
  const activeOptionId = showPanel && results.length > 0
    ? `${listboxId}-option-${results[safeHighlightedIndex]?.id ?? "none"}`
    : undefined;

  useEffect(() => {
    if (!showPanel) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [showPanel]);

  const navigateToDestination = useCallback((destination) => {
    if (!destination?.route) {
      return;
    }

    navigate(destination.route);
    setQuery("");
    setOpen(false);
    setHighlightedIndex(0);
    inputRef.current?.blur();
  }, [navigate]);

  const handleChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setHighlightedIndex(0);
    setOpen(nextQuery.trim().length > 0);
  };

  const handleFocus = () => {
    if (trimmedQuery.length > 0) {
      setOpen(true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      if (showPanel) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (!showPanel) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length === 0) {
        return;
      }
      setHighlightedIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length === 0) {
        return;
      }
      setHighlightedIndex((current) => (
        current <= 0 ? results.length - 1 : current - 1
      ));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const destination = results[safeHighlightedIndex];
      if (destination) {
        navigateToDestination(destination);
      }
    }
  };

  return (
    <div className="pd-admin-header-search" ref={rootRef}>
      <label className="pd-search pd-admin-header-search-field" htmlFor={inputId}>
        <Search size={16} aria-hidden="true" />
        <span className="pd-sr-only">Jump to a page</span>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          placeholder="Jump to a page..."
          aria-label="Jump to a page"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
      </label>

      {showPanel ? (
        <div
          className="pd-admin-header-search-panel"
          id={listboxId}
          role="listbox"
          aria-label="Admin pages"
        >
          {results.length === 0 ? (
            <p className="pd-admin-header-search-empty" role="status">
              No matching pages.
            </p>
          ) : (
            results.map((destination, index) => {
              const isActive = index === safeHighlightedIndex;
              return (
                <button
                  key={destination.id}
                  type="button"
                  id={`${listboxId}-option-${destination.id}`}
                  role="option"
                  aria-selected={isActive}
                  className={`pd-admin-header-search-option${isActive ? " is-active" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => navigateToDestination(destination)}
                >
                  <span className="pd-admin-header-search-option-icon" aria-hidden="true">
                    <AdminNavIcon
                      navId={destination.id}
                      iconKey={destination.icon}
                      size={16}
                    />
                  </span>
                  <span className="pd-admin-header-search-option-label">
                    {destination.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
