import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  fetchCaseCategories,
  fetchSpecialistAssignedCaseRequests,
} from "../../../services/specialistCaseRequestService";
import {
  CASE_REQUEST_CATEGORY_ALL,
  CASE_REQUEST_STATUS_ALL,
  CASE_REQUEST_STATUS_FILTER_DEFS,
  applyCaseRequestListItemLocalization,
  getCaseRequestCategoryLabel,
  getCaseRequestListEmptyMessage,
} from "../utils/specialistCaseRequestMappers";
import { subscribeSpecialistCaseRequestRefresh } from "../utils/specialistCaseRequestRefresh";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 400;

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistCaseRequests(specialistUserId) {
  const { t, locale } = useLocale();
  const [baseItems, setBaseItems] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
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

  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);

  const items = useMemo(
    () => baseItems.map((item) => applyCaseRequestListItemLocalization(item, mapperContext)),
    [baseItems, mapperContext],
  );

  const categories = useMemo(
    () => rawCategories.map((category) => ({
      ...category,
      name: getCaseRequestCategoryLabel(category.name, t),
    })),
    [rawCategories, t],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const statusApiValue = useMemo(() => {
    const match = CASE_REQUEST_STATUS_FILTER_DEFS.find((item) => item.id === statusFilterId);
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
          setRawCategories(next);
        }
      } catch {
        if (!cancelled) {
          setRawCategories([]);
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

        setBaseItems(result.items);
        setHasMore(result.pagination.hasMore);
        setError(null);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setBaseItems([]);
        setHasMore(false);
        setError(resolveErrorMessage(loadError, t("specialist.caseRequests.errors.loadFailed")));
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
    t,
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

      setBaseItems((prev) => {
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
      setLoadMoreError(resolveErrorMessage(loadError, t("specialist.caseRequests.errors.loadMoreFailed")));
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
    t,
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

      setBaseItems(result.items);
      setPage(1);
      pageRef.current = 1;
      setHasMore(result.pagination.hasMore);
    } catch (loadError) {
      if (loadTokenRef.current !== loadToken) {
        return;
      }
      setError(resolveErrorMessage(loadError, t("specialist.caseRequests.errors.loadFailed")));
    } finally {
      if (loadTokenRef.current === loadToken) {
        setIsRefreshing(false);
      }
    }
  }, [specialistUserId, statusApiValue, categoryApiValue, debouncedSearch, t]);

  const emptyMessage = useMemo(
    () => getCaseRequestListEmptyMessage({
      hasItems: items.length > 0,
      hasFilters: hasActiveFilters,
    }, t),
    [items.length, hasActiveFilters, t],
  );

  if (!specialistUserId) {
    return {
      items: [],
      categories: [],
      isInitialLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      error: t("specialist.caseRequests.errors.signInRequired"),
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
