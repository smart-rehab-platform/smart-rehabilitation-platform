import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import {
  loadAdminSupportRequests,
  loadAdminSupportRequestSpecialists,
} from "../../../services/adminSupportRequestsService";
import {
  getAdminSupportRequestsLabels,
} from "../utils/adminSupportRequestsLocalization.js";
import {
  mapSupportRequestPagination,
  mapSupportRequests,
  mapSupportRequestSpecialistOptions,
} from "../../shared-dashboard/utils/supportRequestMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function mergeRequests(existing, incoming) {
  const seen = new Set(existing.map((item) => item.id));
  const merged = [...existing];

  for (const item of incoming) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }

  return merged;
}

export function useAdminSupportRequests() {
  const { t, locale } = useLocale();
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);
  const labels = useMemo(() => getAdminSupportRequestsLabels(t), [t]);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [specialistOptions, setSpecialistOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [specialistsError, setSpecialistsError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const requestSerialRef = useRef(0);
  const refreshRequestedRef = useRef(false);

  const refetch = useCallback(() => {
    refreshRequestedRef.current = true;
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSpecialists() {
      try {
        const users = await loadAdminSupportRequestSpecialists();
        if (!cancelled) {
          setSpecialistOptions(mapSupportRequestSpecialistOptions(users, t));
          setSpecialistsError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setSpecialistOptions([]);
          setSpecialistsError(resolveErrorMessage(loadError, labels.specialistsLoadFailed));
        }
      }
    }

    loadSpecialists();

    return () => {
      cancelled = true;
    };
  }, [labels.specialistsLoadFailed, refreshToken, t]);

  useEffect(() => {
    const serial = requestSerialRef.current + 1;
    requestSerialRef.current = serial;
    let cancelled = false;
    const isRefresh = refreshRequestedRef.current;
    refreshRequestedRef.current = false;

    async function load(page = 1) {
      if (page === 1) {
        if (isRefresh && requests.length > 0) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
      } else {
        setIsLoadingMore(true);
      }

      setError(null);
      if (page > 1) {
        setLoadMoreError(null);
      }

      try {
        const result = await loadAdminSupportRequests({
          page,
          status: selectedStatus || undefined,
          category: selectedCategory || undefined,
          specialist_id: selectedSpecialistId || undefined,
        });

        if (cancelled || requestSerialRef.current !== serial) {
          return;
        }

        const mapped = mapSupportRequests(result.items, mapperOptions);
        setRequests((current) => (page === 1 ? mapped : mergeRequests(current, mapped)));
        setPagination(mapSupportRequestPagination(result.pagination));
      } catch (loadError) {
        if (cancelled || requestSerialRef.current !== serial) {
          return;
        }

        if (page === 1) {
          setRequests([]);
          setError(resolveErrorMessage(loadError, labels.loadFailed));
        } else {
          setLoadMoreError(resolveErrorMessage(loadError, labels.loadingMore));
        }
      } finally {
        if (!cancelled && requestSerialRef.current === serial) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsLoadingMore(false);
        }
      }
    }

    load(1);

    return () => {
      cancelled = true;
    };
  }, [labels.loadFailed, labels.loadingMore, mapperOptions, refreshToken, requests.length, selectedCategory, selectedSpecialistId, selectedStatus]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || isLoadingMore) {
      return;
    }

    const serial = requestSerialRef.current + 1;
    requestSerialRef.current = serial;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await loadAdminSupportRequests({
        page: pagination.page + 1,
        status: selectedStatus || undefined,
        category: selectedCategory || undefined,
        specialist_id: selectedSpecialistId || undefined,
      });

      if (requestSerialRef.current !== serial) {
        return;
      }

      const mapped = mapSupportRequests(result.items, mapperOptions);
      setRequests((current) => mergeRequests(current, mapped));
      setPagination(mapSupportRequestPagination(result.pagination));
    } catch (loadError) {
      if (requestSerialRef.current === serial) {
        setLoadMoreError(resolveErrorMessage(loadError, labels.loadingMore));
      }
    } finally {
      if (requestSerialRef.current === serial) {
        setIsLoadingMore(false);
      }
    }
  }, [
    pagination,
    isLoadingMore,
    selectedStatus,
    selectedCategory,
    selectedSpecialistId,
    labels.loadingMore,
    mapperOptions,
  ]);

  const clearFilters = useCallback(() => {
    setSelectedStatus("");
    setSelectedCategory("");
    setSelectedSpecialistId("");
  }, []);

  const hasActiveFilters = Boolean(selectedStatus || selectedCategory || selectedSpecialistId);

  return {
    labels,
    requests,
    pagination,
    specialistOptions,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedSpecialistId,
    setSelectedSpecialistId,
    hasActiveFilters,
    clearFilters,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    specialistsError,
    loadMoreError,
    hasMore: Boolean(pagination?.hasMore),
    refetch,
    loadMore,
  };
}
