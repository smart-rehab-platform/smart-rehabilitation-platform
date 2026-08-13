import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCaseCategories,
  fetchSpecialistAssignedCaseRequests,
} from "../../../services/specialistCaseRequestService";
import {
  CASE_REQUEST_CATEGORY_ALL,
  CASE_REQUEST_STATUS_ALL,
  CASE_REQUEST_STATUS_FILTERS,
  getCaseRequestListEmptyMessage,
} from "../utils/specialistCaseRequestMappers";
import { subscribeSpecialistCaseRequestRefresh } from "../utils/specialistCaseRequestRefresh";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistCaseRequests(specialistUserId) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilterId, setStatusFilterId] = useState(CASE_REQUEST_STATUS_ALL);
  const [categoryFilterId, setCategoryFilterId] = useState(CASE_REQUEST_CATEGORY_ALL);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const loadTokenRef = useRef(0);
  const pageRef = useRef(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const statusApiValue = useMemo(() => {
    const match = CASE_REQUEST_STATUS_FILTERS.find((item) => item.id === statusFilterId);
    return match?.apiValue || null;
  }, [statusFilterId]);

  const categoryApiValue = categoryFilterId === CASE_REQUEST_CATEGORY_ALL
    ? null
    : categoryFilterId;

  const hasActiveFilters = Boolean(
    statusFilterId !== CASE_REQUEST_STATUS_ALL
      || categoryFilterId !== CASE_REQUEST_CATEGORY_ALL
      || searchInput.trim(),
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilterId(CASE_REQUEST_STATUS_ALL);
    setCategoryFilterId(CASE_REQUEST_CATEGORY_ALL);
  }, []);

  useEffect(() => {
    return subscribeSpecialistCaseRequestRefresh(() => {
      setRefreshToken((value) => value + 1);
    });
  }, []);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    let cancelled = false;

    async function loadCategories() {
      try {
        const next = await fetchCaseCategories();
        if (!cancelled) {
          setCategories(next);
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
  }, [specialistUserId]);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadFirstPage() {
      setIsInitialLoading(true);
      setIsRefreshing(false);
      setError(null);
      setLoadMoreError(null);
      setPage(1);
      pageRef.current = 1;

      try {
        const result = await fetchSpecialistAssignedCaseRequests({
          page: 1,
          limit: PAGE_LIMIT,
          status: statusApiValue,
          categoryId: categoryApiValue,
          childName: debouncedSearch || undefined,
        });

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setItems(result.items);
        setHasMore(result.pagination.hasMore);
        setError(null);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setItems([]);
        setHasMore(false);
        setError(resolveErrorMessage(loadError, "Failed to load assigned case requests."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsInitialLoading(false);
        }
      }
    }

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [
    specialistUserId,
    statusApiValue,
    categoryApiValue,
    debouncedSearch,
    refreshToken,
  ]);

  const loadMore = useCallback(async () => {
    if (!specialistUserId || isInitialLoading || isLoadingMore || !hasMore) {
      return;
    }

    const nextPage = pageRef.current + 1;
    const loadToken = loadTokenRef.current;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await fetchSpecialistAssignedCaseRequests({
        page: nextPage,
        limit: PAGE_LIMIT,
        status: statusApiValue,
        categoryId: categoryApiValue,
        childName: debouncedSearch || undefined,
      });

      if (loadTokenRef.current !== loadToken) {
        return;
      }

      setItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        result.items.forEach((item) => {
          if (!seen.has(item.id)) {
            merged.push(item);
          }
        });
        return merged;
      });
      pageRef.current = nextPage;
      setPage(nextPage);
      setHasMore(result.pagination.hasMore);
    } catch (loadError) {
      if (loadTokenRef.current !== loadToken) {
        return;
      }
      setLoadMoreError(resolveErrorMessage(loadError, "Failed to load more case requests."));
    } finally {
      if (loadTokenRef.current === loadToken) {
        setIsLoadingMore(false);
      }
    }
  }, [
    specialistUserId,
    isInitialLoading,
    isLoadingMore,
    hasMore,
    statusApiValue,
    categoryApiValue,
    debouncedSearch,
  ]);

  const refresh = useCallback(async () => {
    if (!specialistUserId) {
      return;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    setIsRefreshing(true);
    setError(null);
    setLoadMoreError(null);

    try {
      const result = await fetchSpecialistAssignedCaseRequests({
        page: 1,
        limit: PAGE_LIMIT,
        status: statusApiValue,
        categoryId: categoryApiValue,
        childName: debouncedSearch || undefined,
      });

      if (loadTokenRef.current !== loadToken) {
        return;
      }

      setItems(result.items);
      setPage(1);
      pageRef.current = 1;
      setHasMore(result.pagination.hasMore);
    } catch (loadError) {
      if (loadTokenRef.current !== loadToken) {
        return;
      }
      setError(resolveErrorMessage(loadError, "Failed to load assigned case requests."));
    } finally {
      if (loadTokenRef.current === loadToken) {
        setIsRefreshing(false);
      }
    }
  }, [specialistUserId, statusApiValue, categoryApiValue, debouncedSearch]);

  const emptyMessage = useMemo(
    () => getCaseRequestListEmptyMessage({
      hasItems: items.length > 0,
      hasFilters: hasActiveFilters,
    }),
    [items.length, hasActiveFilters],
  );

  if (!specialistUserId) {
    return {
      items: [],
      categories: [],
      isInitialLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: "Please sign in to view case requests.",
      loadMoreError: null,
      searchInput,
      setSearchInput,
      statusFilterId,
      setStatusFilterId,
      categoryFilterId,
      setCategoryFilterId,
      hasActiveFilters: false,
      hasMore: false,
      emptyMessage: null,
      clearFilters,
      reload,
      refresh,
      loadMore,
      page,
    };
  }

  return {
    items,
    categories,
    isInitialLoading,
    isRefreshing,
    isLoadingMore,
    error,
    loadMoreError,
    searchInput,
    setSearchInput,
    statusFilterId,
    setStatusFilterId,
    categoryFilterId,
    setCategoryFilterId,
    hasActiveFilters,
    hasMore,
    emptyMessage,
    clearFilters,
    reload,
    refresh,
    loadMore,
    page,
  };
}
