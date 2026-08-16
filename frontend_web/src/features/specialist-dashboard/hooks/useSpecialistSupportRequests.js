import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { loadSpecialistSupportRequests } from "../../../services/specialistSupportRequestsService";
import { mapSupportRequests } from "../../shared-dashboard/utils/supportRequestMappers";
import { getSpecialistSupportValidationMessages } from "../utils/specialistSupportRequestsLocalization.js";
function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistSupportRequests() {
  const { t, locale } = useLocale();
  const errorMessages = useMemo(() => getSpecialistSupportValidationMessages(t), [t]);
  const mapperOptions = useMemo(() => ({ t, locale }), [t, locale]);  const [requests, setRequests] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const rows = await loadSpecialistSupportRequests({
          status: selectedStatus || undefined,
          category: selectedCategory || undefined,
        });

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setRequests(mapSupportRequests(rows, mapperOptions));
      } catch (loadError) {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setRequests([]);
          setError(resolveErrorMessage(loadError, errorMessages.loadFailed));        }
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedStatus, selectedCategory, refreshToken, mapperOptions, errorMessages.loadFailed]);
  const clearFilters = useCallback(() => {
    setSelectedStatus("");
    setSelectedCategory("");
  }, []);

  const hasActiveFilters = Boolean(selectedStatus || selectedCategory);

  return {
    requests,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearFilters,
    isLoading,
    error,
    refetch,
  };
}
