import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  createRegularReport,
  generateAiReport,
  loadPatientScopedReports,
  loadSpecialistScopedReports,
} from "../../../services/specialistReportService";
import { validateSpecialistAiReportGeneration } from "../utils/specialistAiReportGeneration";
import { validateSpecialistRegularReportCreation } from "../utils/specialistRegularReportCreation";
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
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [isCreatingRegularReport, setIsCreatingRegularReport] = useState(false);
  const [regularCreationError, setRegularCreationError] = useState(null);
  const loadTokenRef = useRef(0);

  const scopedPatientId = patientId?.trim() || null;
  const isPatientScoped = Boolean(scopedPatientId);
  const loadFailedError = t("specialist.reports.errors.loadFailed");
  const signInRequiredError = t("specialist.reports.errors.signInRequired");
  const generateFailedError = t("specialist.reports.generate.failed");
  const createFailedError = t("specialist.reports.create.failed");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const clearGenerationError = useCallback(() => {
    setGenerationError(null);
  }, []);

  const clearRegularCreationError = useCallback(() => {
    setRegularCreationError(null);
  }, []);

  const generateAiReportForPatient = useCallback(async ({
    patientId: selectedPatientId,
    reportType,
    periodStart,
    periodEnd,
  }) => {
    if (isGeneratingAiReport) {
      return { ok: false };
    }

    const validationError = validateSpecialistAiReportGeneration({
      patientId: selectedPatientId,
      reportType,
      periodStart,
      periodEnd,
      t,
    });

    if (validationError) {
      setGenerationError(validationError);
      return { ok: false, message: validationError };
    }

    if (!specialistUserId) {
      const message = signInRequiredError;
      setGenerationError(message);
      return { ok: false, message };
    }

    setIsGeneratingAiReport(true);
    setGenerationError(null);

    try {
      const report = await generateAiReport({
        reportType,
        patientId: selectedPatientId,
        periodStart,
        periodEnd,
        language: locale,
      });
      setIsGeneratingAiReport(false);
      reload();
      return { ok: true, report };
    } catch (generateError) {
      const message = resolveErrorMessage(generateError, generateFailedError);
      setIsGeneratingAiReport(false);
      setGenerationError(message);
      return { ok: false, message };
    }
  }, [
    generateFailedError,
    isGeneratingAiReport,
    locale,
    reload,
    signInRequiredError,
    specialistUserId,
    t,
  ]);

  const createRegularReportForPatient = useCallback(async ({
    patientId: selectedPatientId,
    reportType,
    title,
    summary,
  }) => {
    if (isCreatingRegularReport) {
      return { ok: false };
    }

    const validationError = validateSpecialistRegularReportCreation({
      patientId: selectedPatientId,
      reportType,
      title,
      summary,
      t,
    });

    if (validationError) {
      setRegularCreationError(validationError);
      return { ok: false, message: validationError };
    }

    if (!specialistUserId) {
      const message = signInRequiredError;
      setRegularCreationError(message);
      return { ok: false, message };
    }

    setIsCreatingRegularReport(true);
    setRegularCreationError(null);

    try {
      await createRegularReport({
        patientId: selectedPatientId,
        reportType,
        title,
        summary,
      });
      setIsCreatingRegularReport(false);
      reload();
      return { ok: true };
    } catch (createError) {
      const message = resolveErrorMessage(createError, createFailedError);
      setIsCreatingRegularReport(false);
      setRegularCreationError(message);
      return { ok: false, message };
    }
  }, [
    createFailedError,
    isCreatingRegularReport,
    reload,
    signInRequiredError,
    specialistUserId,
    t,
  ]);

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
      isGeneratingAiReport: false,
      generationError: null,
      clearGenerationError,
      generateAiReport: generateAiReportForPatient,
      isCreatingRegularReport: false,
      regularCreationError: null,
      clearRegularCreationError,
      createRegularReport: createRegularReportForPatient,
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
    isGeneratingAiReport,
    generationError,
    clearGenerationError,
    generateAiReport: generateAiReportForPatient,
    isCreatingRegularReport,
    regularCreationError,
    clearRegularCreationError,
    createRegularReport: createRegularReportForPatient,
  };
}
