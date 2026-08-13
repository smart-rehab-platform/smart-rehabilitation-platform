import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadAdminComplaintSpecialists,
  loadAdminComplaints,
} from "../../../services/adminComplaintsService";
import {
  COMPLAINT_PAGE_LIMIT,
  buildComplaintDateRangeIso,
  isComplaintDateRangeInvalid,
  mapAdminComplaints,
  mapComplaintPagination,
  mapComplaintSpecialistOptions,
} from "../utils/adminComplaintsMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function mergeComplaints(existing, incoming) {
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

export function useAdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [pagination, setPagination] = useState(() => mapComplaintPagination(null));

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const [specialistsError, setSpecialistsError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const refreshRequestedRef = useRef(false);

  const requestSerialRef = useRef(0);

  const dateRangeError = useMemo(() => {
    if (!fromDate || !toDate) {
      return null;
    }

    if (isComplaintDateRangeInvalid(fromDate, toDate)) {
      return "From date cannot be after To date.";
    }

    return null;
  }, [fromDate, toDate]);

  const hasActiveFilters = Boolean(
    selectedStatus
    || selectedCategory
    || selectedSpecialistId
    || fromDate
    || toDate,
  );

  const specialistOptions = useMemo(
    () => mapComplaintSpecialistOptions(specialists),
    [specialists],
  );

  const hasMore = Boolean(pagination?.hasMore);

  const clearFilters = useCallback(() => {
    setSelectedStatus("");
    setSelectedCategory("");
    setSelectedSpecialistId("");
    setFromDate("");
    setToDate("");
  }, []);

  const refresh = useCallback(() => {
    refreshRequestedRef.current = true;
    setRefreshToken((value) => value + 1);
  }, []);

  const buildListParams = useCallback((page) => {
    const params = {
      page,
      limit: COMPLAINT_PAGE_LIMIT,
    };

    if (selectedStatus) {
      params.status = selectedStatus;
    }
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    if (selectedSpecialistId) {
      params.specialist_id = selectedSpecialistId;
    }

    if (!dateRangeError) {
      const range = buildComplaintDateRangeIso(fromDate, toDate);
      if (range.from) {
        params.from = range.from;
      }
      if (range.to) {
        params.to = range.to;
      }
    }

    return params;
  }, [
    dateRangeError,
    fromDate,
    selectedCategory,
    selectedSpecialistId,
    selectedStatus,
    toDate,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadSpecialists() {
      try {
        const rows = await loadAdminComplaintSpecialists();
        if (!cancelled) {
          setSpecialists(rows);
          setSpecialistsError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setSpecialists([]);
          setSpecialistsError(
            resolveErrorMessage(loadError, "Failed to load specialists."),
          );
        }
      }
    }

    loadSpecialists();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  useEffect(() => {
    if (dateRangeError) {
      return undefined;
    }

    const serial = requestSerialRef.current + 1;
    requestSerialRef.current = serial;
    let cancelled = false;

    async function loadInitialPage() {
      const treatAsRefresh = refreshRequestedRef.current;
      refreshRequestedRef.current = false;

      setIsLoading(true);
      setIsRefreshing(treatAsRefresh);
      setError(null);
      setLoadMoreError(null);

      try {
        const result = await loadAdminComplaints(buildListParams(1));
        if (cancelled || requestSerialRef.current !== serial) {
          return;
        }

        setComplaints(mapAdminComplaints(result.items));
        setPagination(mapComplaintPagination(result.pagination));
        setError(null);
        setLoadMoreError(null);
      } catch (loadError) {
        if (cancelled || requestSerialRef.current !== serial) {
          return;
        }

        setComplaints([]);
        setPagination(mapComplaintPagination(null));
        setError(resolveErrorMessage(loadError, "Failed to load complaints."));
      } finally {
        if (!cancelled && requestSerialRef.current === serial) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadInitialPage();

    return () => {
      cancelled = true;
    };
  }, [
    buildListParams,
    dateRangeError,
    fromDate,
    refreshToken,
    selectedCategory,
    selectedSpecialistId,
    selectedStatus,
    toDate,
  ]);

  const loadMore = useCallback(async () => {
    if (dateRangeError || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    const nextPage = (pagination?.page ?? 1) + 1;
    const serial = requestSerialRef.current + 1;
    requestSerialRef.current = serial;

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await loadAdminComplaints(buildListParams(nextPage));
      if (requestSerialRef.current !== serial) {
        return;
      }

      const mapped = mapAdminComplaints(result.items);
      setComplaints((current) => mergeComplaints(current, mapped));
      setPagination(mapComplaintPagination(result.pagination));
      setLoadMoreError(null);
    } catch (loadError) {
      if (requestSerialRef.current !== serial) {
        return;
      }

      setLoadMoreError(resolveErrorMessage(loadError, "Failed to load more complaints."));
    } finally {
      if (requestSerialRef.current === serial) {
        setIsLoadingMore(false);
      }
    }
  }, [
    buildListParams,
    dateRangeError,
    hasMore,
    isLoading,
    isLoadingMore,
    pagination?.page,
  ]);

  return {
    complaints,
    specialists,
    specialistOptions,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedSpecialistId,
    setSelectedSpecialistId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    dateRangeError,
    hasActiveFilters,
    clearFilters,
    isLoading,
    isRefreshing,
    error,
    specialistsError,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    refresh,
    pagination,
  };
}
