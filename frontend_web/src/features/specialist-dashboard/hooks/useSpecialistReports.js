import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  loadPatientScopedReports,
  loadSpecialistScopedReports,
} from "../../../services/specialistReportService";
import { filterVisibleReports } from "../utils/specialistReportMappers";
import { applyReportListItemLocalization } from "../utils/specialistReportsLocalization";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistReports(specialistUserId, patientId = null) {
  const { t, locale } = useLocale();
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
  const loadFailedError = t("specialist.reports.errors.loadFailed");
  const signInRequiredError = t("specialist.reports.errors.signInRequired");

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
        setError(resolveErrorMessage(loadError, loadFailedError));
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
  }, [specialistUserId, scopedPatientId, isPatientScoped, refreshToken, loadFailedError]);

  const localizedReports = useMemo(
    () => reports.map((report) => applyReportListItemLocalization(report, { t, locale })),
    [reports, t, locale],
  );

  const visibleReports = useMemo(
    () => filterVisibleReports(localizedReports, { filterId, searchQuery }),
    [localizedReports, filterId, searchQuery],
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
      error: signInRequiredError,
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
    reports: localizedReports,
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
