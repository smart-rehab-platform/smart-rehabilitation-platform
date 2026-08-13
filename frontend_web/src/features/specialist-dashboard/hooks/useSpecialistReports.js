import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  loadPatientScopedReports,
  loadSpecialistScopedReports,
} from "../../../services/specialistReportService";
import { filterVisibleReports } from "../utils/specialistReportMappers";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistReports(specialistUserId, patientId = null) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [refreshToken, setRefreshToken] = useState(0);
  const [patientName, setPatientName] = useState(null);
  const loadTokenRef = useRef(0);

  const scopedPatientId = patientId?.trim() || null;
  const isPatientScoped = Boolean(scopedPatientId);

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!specialistUserId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadReports() {
      setIsLoading(true);
      setError(null);

      try {
        const nextReports = isPatientScoped
          ? await loadPatientScopedReports(specialistUserId, scopedPatientId)
          : await loadSpecialistScopedReports(specialistUserId);

        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }

        setReports(nextReports);
        if (isPatientScoped && nextReports.length > 0) {
          setPatientName(nextReports[0].patientName || null);
        } else if (!isPatientScoped) {
          setPatientName(null);
        }
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setReports([]);
        setError(resolveErrorMessage(loadError, "Failed to load reports."));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, [specialistUserId, scopedPatientId, isPatientScoped, refreshToken]);

  const visibleReports = useMemo(
    () => filterVisibleReports(reports, { filterId, searchQuery }),
    [reports, filterId, searchQuery],
  );

  const hasAiReports = useMemo(
    () => reports.some((report) => report.isAi),
    [reports],
  );

  if (!specialistUserId) {
    return {
      reports: [],
      visibleReports: [],
      isLoading: false,
      error: "Please sign in to view reports.",
      searchQuery,
      setSearchQuery,
      filterId,
      setFilterId,
      hasAiReports: false,
      isPatientScoped,
      patientName,
      reload,
    };
  }

  return {
    reports,
    visibleReports,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterId,
    setFilterId,
    hasAiReports,
    isPatientScoped,
    patientName,
    reload,
  };
}
