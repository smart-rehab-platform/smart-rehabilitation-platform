import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  discardAiReport,
  exportReportPdf,
  loadReportDetail,
  updateAiReportDraft,
} from "../../../services/specialistReportService";
import {
  AI_REPORT_EDITABLE_LIST_FIELDS,
  AI_REPORT_EDITABLE_NARRATIVE_FIELDS,
  areAiReportDraftFormsEqual,
  buildAiReportDraftFormState,
  buildAiReportDraftUpdatePayload,
  canStartAiReportDraftEdit,
  hasAiReportDraftClinicalContent,
  listFieldTextToArray,
} from "../utils/specialistAiReportDraftEdit";
import { applyReportDetailLocalization } from "../utils/specialistReportsLocalization";

function resolveErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export function useSpecialistReportDetails(reportId, isAiReport) {
  const { t, locale } = useLocale();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftForm, setDraftForm] = useState(null);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const loadTokenRef = useRef(0);

  const loadDetailFailedError = t("specialist.reports.errors.loadDetailFailed");
  const generatePdfFailedError = t("specialist.reports.errors.generatePdfFailed");
  const discardFailedError = t("specialist.reports.discard.failed");
  const saveFailedError = t("specialist.reports.edit.saveFailed");
  const emptyContentError = t("specialist.reports.edit.emptyContent");

  const reload = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!reportId) {
      return undefined;
    }

    const loadToken = loadTokenRef.current + 1;
    loadTokenRef.current = loadToken;
    let cancelled = false;

    async function loadDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      setIsEditing(false);
      setDraftForm(null);

      try {
        const nextDetail = await loadReportDetail(reportId, isAiReport);
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setDetail(nextDetail);
      } catch (loadError) {
        if (cancelled || loadTokenRef.current !== loadToken) {
          return;
        }
        setDetail(null);
        setError(resolveErrorMessage(loadError, loadDetailFailedError));
      } finally {
        if (!cancelled && loadTokenRef.current === loadToken) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [reportId, isAiReport, refreshToken, loadDetailFailedError]);

  const localizedDetail = useMemo(
    () => (detail ? applyReportDetailLocalization(detail, { t, locale }) : null),
    [detail, t, locale],
  );

  const startEditing = useCallback(() => {
    if (!canStartAiReportDraftEdit(detail) || isExporting || isDiscarding || isSavingDraft) {
      return false;
    }
    setDraftForm(buildAiReportDraftFormState(detail));
    setIsEditing(true);
    setError(null);
    return true;
  }, [detail, isExporting, isDiscarding, isSavingDraft]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setDraftForm(null);
    setError(null);
  }, []);

  const updateDraftField = useCallback((fieldId, value) => {
    setDraftForm((prev) => (prev ? { ...prev, [fieldId]: value } : prev));
  }, []);

  const saveDraft = useCallback(async () => {
    if (!reportId || !isAiReport || !isEditing || !draftForm || isSavingDraft) {
      return false;
    }

    if (!hasAiReportDraftClinicalContent(draftForm)) {
      setError(emptyContentError);
      return false;
    }

    setIsSavingDraft(true);
    setError(null);

    try {
      const payload = buildAiReportDraftUpdatePayload(draftForm);
      const nextDetail = await updateAiReportDraft(reportId, payload);
      setDetail(nextDetail);
      setIsEditing(false);
      setDraftForm(null);
      return true;
    } catch (saveError) {
      setError(resolveErrorMessage(saveError, saveFailedError));
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    reportId,
    isAiReport,
    isEditing,
    draftForm,
    isSavingDraft,
    emptyContentError,
    saveFailedError,
  ]);

  const generatePdf = useCallback(async () => {
    if (!reportId || isExporting || isEditing || isSavingDraft) {
      return false;
    }

    setIsExporting(true);
    setError(null);

    try {
      const nextDetail = await exportReportPdf(reportId, isAiReport);
      setDetail(nextDetail);
      return true;
    } catch (exportError) {
      setError(resolveErrorMessage(exportError, generatePdfFailedError));
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [reportId, isAiReport, isExporting, isEditing, isSavingDraft, generatePdfFailedError]);

  const discardReport = useCallback(async () => {
    if (!reportId || !isAiReport || isDiscarding || isEditing || isSavingDraft) {
      return false;
    }

    setIsDiscarding(true);
    setError(null);

    try {
      await discardAiReport(reportId);
      return true;
    } catch (discardError) {
      setError(resolveErrorMessage(discardError, discardFailedError));
      return false;
    } finally {
      setIsDiscarding(false);
    }
  }, [reportId, isAiReport, isDiscarding, isEditing, isSavingDraft, discardFailedError]);

  return {
    detail: localizedDetail,
    isLoading,
    isExporting,
    isDiscarding,
    isSavingDraft,
    isEditing,
    draftForm,
    error,
    reload,
    generatePdf,
    discardReport,
    startEditing,
    cancelEditing,
    updateDraftField,
    saveDraft,
  };
}
