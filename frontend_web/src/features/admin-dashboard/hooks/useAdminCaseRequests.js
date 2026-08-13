import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchCaseCategories } from "../../../services/adminPatientsService";
import { fetchAdminCaseRequestsInbox } from "../../../services/adminCaseRequestsService";
import {
  mapAdminCaseInboxItem,
  mapCaseCategoryOption,
  mapInboxPagination,
} from "../utils/adminCaseRequestsMappers";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function mergeItems(existing, incoming) {
  const seen = new Set(existing.map((item) => item.id));
  const merged = [...existing];

  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

export function useAdminCaseRequests() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(() => mapInboxPagination(null, PAGE_LIMIT));
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const requestSerialRef = useRef(0);
  const searchDebounceRef = useRef(null);

  const categoryOptions = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories],
  );

  const hasActiveFilters = Boolean(
    debouncedSearch.trim()
    || statusFilter
    || categoryFilter,
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const loadPage = useCallback(async (page, mode) => {
    const serial = requestSerialRef.current + 1;
    requestSerialRef.current = serial;

    if (mode === "initial") {
      setIsLoading(true);
      setError(null);
      setLoadMoreError(null);
    } else if (mode === "loadMore") {
      setIsLoadingMore(true);
      setLoadMoreError(null);
    }

    const params = {
      page,
      limit: PAGE_LIMIT,
    };

    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) {
      params.child_name = trimmedSearch;
    }
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (categoryFilter) {
      params.category_id = categoryFilter;
    }

    try {
      const result = await fetchAdminCaseRequestsInbox(params);
      if (requestSerialRef.current !== serial) {
        return;
      }

      const mappedItems = result.items.map(mapAdminCaseInboxItem).filter(Boolean);
      setItems((current) => (mode === "loadMore" ? mergeItems(current, mappedItems) : mappedItems));
      setPagination(mapInboxPagination(result.pagination, PAGE_LIMIT));
      setError(null);
      setLoadMoreError(null);
    } catch (loadError) {
      if (requestSerialRef.current !== serial) {
        return;
      }

      const message = resolveErrorMessage(loadError, "Failed to load case requests.");
      if (mode === "loadMore") {
        setLoadMoreError(message);
      } else {
        setItems([]);
        setError(message);
      }
    } finally {
      if (requestSerialRef.current === serial) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [categoryFilter, debouncedSearch, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const rows = await fetchCaseCategories();
        if (!cancelled) {
          setCategories(rows.map(mapCaseCategoryOption).filter(Boolean));
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  useEffect(() => {
    const serial = requestSerialRef.current + 1;
    requestSerialRef.current = serial;
    let cancelled = false;

    async function loadInitialPage() {
      setIsLoading(true);
      setError(null);
      setLoadMoreError(null);

      const params = {
        page: 1,
        limit: PAGE_LIMIT,
      };

      const trimmedSearch = debouncedSearch.trim();
      if (trimmedSearch) {
        params.child_name = trimmedSearch;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (categoryFilter) {
        params.category_id = categoryFilter;
      }

      try {
        const result = await fetchAdminCaseRequestsInbox(params);
        if (cancelled || requestSerialRef.current !== serial) {
          return;
        }

        const mappedItems = result.items.map(mapAdminCaseInboxItem).filter(Boolean);
        setItems(mappedItems);
        setPagination(mapInboxPagination(result.pagination, PAGE_LIMIT));
        setError(null);
        setLoadMoreError(null);
      } catch (loadError) {
        if (cancelled || requestSerialRef.current !== serial) {
          return;
        }

        setItems([]);
        setError(resolveErrorMessage(loadError, "Failed to load case requests."));
      } finally {
        if (!cancelled && requestSerialRef.current === serial) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    }

    loadInitialPage();

    return () => {
      cancelled = true;
    };
  }, [categoryFilter, debouncedSearch, refreshToken, statusFilter]);

  const loadMore = useCallback(() => {
    if (!pagination.hasNextPage || isLoading || isLoadingMore) {
      return;
    }

    loadPage(pagination.page + 1, "loadMore");
  }, [isLoading, isLoadingMore, loadPage, pagination.hasNextPage, pagination.page]);

  const emptyKind = useMemo(() => {
    if (isLoading || error) {
      return null;
    }

    if (items.length === 0 && !hasActiveFilters) {
      return "no-requests";
    }

    if (items.length === 0 && hasActiveFilters) {
      return "no-matches";
    }

    return null;
  }, [error, hasActiveFilters, isLoading, items.length]);

  return {
    items,
    categoryOptions,
    pagination,
    searchQuery,
    statusFilter,
    categoryFilter,
    isLoading,
    isLoadingMore,
    error,
    loadMoreError,
    hasActiveFilters,
    emptyKind,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    reload,
    loadMore,
    retryLoadMore: () => loadPage(pagination.page + 1, "loadMore"),
  };
}
