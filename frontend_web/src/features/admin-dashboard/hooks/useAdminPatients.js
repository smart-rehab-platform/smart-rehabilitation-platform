import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildConditionFilterOptions,
  filterAdminPatients,
  mapAdminPatientRecord,
  mapCaseCategory,
} from "../utils/adminPatientsMappers";
import {
  fetchAdminPatients,
  fetchCaseCategories,
} from "../../../services/adminPatientsService";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useAdminPatients() {
  const [patients, setPatients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const conditionOptions = useMemo(
    () => buildConditionFilterOptions(categories, patients),
    [categories, patients],
  );

  const effectiveConditionFilter = useMemo(() => {
    if (!conditionFilter) {
      return null;
    }

    return conditionOptions.includes(conditionFilter) ? conditionFilter : null;
  }, [conditionFilter, conditionOptions]);

  const filteredPatients = useMemo(
    () => filterAdminPatients(patients, {
      search: searchQuery,
      conditionFilter: effectiveConditionFilter,
    }),
    [patients, searchQuery, effectiveConditionFilter],
  );

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadPatientsAndCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const patientRows = await fetchAdminPatients();

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setPatients(patientRows.map(mapAdminPatientRecord).filter(Boolean));

        try {
          const categoryRows = await fetchCaseCategories();
          if (!cancelled && loadTokenRef.current === loadToken) {
            setCategories(categoryRows.map(mapCaseCategory).filter(Boolean));
          }
        } catch {
          if (!cancelled && loadTokenRef.current === loadToken) {
            setCategories([]);
          }
        }
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setPatients([]);
        setCategories([]);
        setError(resolveErrorMessage(loadError, "Failed to load patients."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadPatientsAndCategories();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return {
    patients,
    filteredPatients,
    conditionOptions,
    isLoading,
    error,
    searchQuery,
    conditionFilter,
    effectiveConditionFilter,
    setSearchQuery,
    setConditionFilter,
    reload,
  };
}
