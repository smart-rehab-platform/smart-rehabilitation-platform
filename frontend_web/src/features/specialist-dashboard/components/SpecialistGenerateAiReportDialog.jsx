import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistPatients } from "../../../services/specialistPatientService";
import {
  AI_REPORT_TYPES,
  defaultPeriodForSpecialistAiReportType,
  formatSpecialistAiReportDate,
} from "../utils/specialistAiReportGeneration";
import { mapSpecialistPatientList } from "../utils/specialistPatientMappers";

function resolveTodayInputValue(now = new Date()) {
  return formatSpecialistAiReportDate(now);
}

export function SpecialistGenerateAiReportDialog({
  open,
  onClose,
  specialistUserId,
  initialPatientId = null,
  isGenerating = false,
  generationError = null,
  onClearGenerationError,
  onGenerate,
}) {
  const { t } = useLocale();
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [reportType, setReportType] = useState(AI_REPORT_TYPES.WEEKLY);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [localError, setLocalError] = useState(null);

  const todayValue = useMemo(() => resolveTodayInputValue(), [open]);
  const displayError = localError || generationError || patientsError;

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaults = defaultPeriodForSpecialistAiReportType(AI_REPORT_TYPES.WEEKLY);
    setReportType(AI_REPORT_TYPES.WEEKLY);
    setPeriodStart(defaults.start);
    setPeriodEnd(defaults.end);
    setLocalError(null);
    setPatientsError(null);
    onClearGenerationError?.();

    const scopedPatientId = initialPatientId?.trim() || "";
    setSelectedPatientId(scopedPatientId);
  }, [open, initialPatientId, onClearGenerationError]);

  useEffect(() => {
    if (!open || !specialistUserId) {
      return undefined;
    }

    let cancelled = false;

    async function loadPatients() {
      setIsLoadingPatients(true);
      setPatientsError(null);

      try {
        const rows = await loadSpecialistPatients(specialistUserId);
        if (cancelled) {
          return;
        }

        const nextPatients = mapSpecialistPatientList(rows);
        setPatients(nextPatients);

        setSelectedPatientId((current) => {
          if (current && nextPatients.some((patient) => patient.id === current)) {
            return current;
          }
          const scopedPatientId = initialPatientId?.trim() || "";
          if (scopedPatientId && nextPatients.some((patient) => patient.id === scopedPatientId)) {
            return scopedPatientId;
          }
          return "";
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setPatients([]);
        setPatientsError(error instanceof Error ? error.message : t("specialist.reports.generate.loadPatientsFailed"));
      } finally {
        if (!cancelled) {
          setIsLoadingPatients(false);
        }
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [open, specialistUserId, initialPatientId, t]);

  const handleReportTypeChange = (nextType) => {
    if (nextType === reportType || isGenerating) {
      return;
    }

    const defaults = defaultPeriodForSpecialistAiReportType(nextType);
    setReportType(nextType);
    setPeriodStart(defaults.start);
    setPeriodEnd(defaults.end);
    setLocalError(null);
    onClearGenerationError?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);
    onClearGenerationError?.();

    const result = await onGenerate?.({
      patientId: selectedPatientId,
      reportType,
      periodStart,
      periodEnd,
    });

    if (result?.ok) {
      onClose?.();
    } else if (result?.message) {
      setLocalError(result.message);
    }
  };

  if (!open) {
    return null;
  }

  const canSubmit = Boolean(selectedPatientId)
    && Boolean(periodStart)
    && Boolean(periodEnd)
    && !isGenerating
    && !isLoadingPatients
    && patients.length > 0;

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => !isGenerating && onClose?.()}>
      <div
        className="pd-modal pd-specialist-generate-ai-report-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-generate-ai-report-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-generate-ai-report-title" className="pd-modal-title">
          {t("specialist.reports.generate.title")}
        </h2>
        <p className="pd-section-sub pd-specialist-generate-ai-report-subtitle">
          {t("specialist.reports.generate.subtitle")}
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="pd-field-label" htmlFor="specialist-generate-ai-report-patient">
            {t("specialist.reports.generate.patient")}
          </label>
          <select
            id="specialist-generate-ai-report-patient"
            className="pd-specialist-treatment-plan-control pd-specialist-treatment-plan-select"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setLocalError(null);
              onClearGenerationError?.();
            }}
            disabled={isGenerating || isLoadingPatients || patients.length === 0}
          >
            <option value="">
              {isLoadingPatients
                ? t("specialist.reports.generate.loadingPatients")
                : t("specialist.reports.generate.selectPatient")}
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>

          {!isLoadingPatients && patients.length === 0 ? (
            <p className="pd-section-sub pd-specialist-generate-ai-report-hint">
              {t("specialist.reports.generate.noPatients")}
            </p>
          ) : null}

          <span className="pd-field-label">{t("specialist.reports.generate.reportType")}</span>
          <div
            className="pd-specialist-generate-ai-report-segments"
            role="group"
            aria-label={t("specialist.reports.generate.reportType")}
          >
            <button
              type="button"
              className={`pd-specialist-sessions-segment${reportType === AI_REPORT_TYPES.WEEKLY ? " is-active" : ""}`}
              onClick={() => handleReportTypeChange(AI_REPORT_TYPES.WEEKLY)}
              disabled={isGenerating}
            >
              {t("specialist.reports.generate.weekly")}
            </button>
            <button
              type="button"
              className={`pd-specialist-sessions-segment${reportType === AI_REPORT_TYPES.MONTHLY ? " is-active" : ""}`}
              onClick={() => handleReportTypeChange(AI_REPORT_TYPES.MONTHLY)}
              disabled={isGenerating}
            >
              {t("specialist.reports.generate.monthly")}
            </button>
          </div>

          <span className="pd-field-label">{t("specialist.reports.generate.reportingPeriod")}</span>
          <div className="pd-specialist-generate-ai-report-date-row">
            <div className="pd-specialist-generate-ai-report-date-field">
              <label className="pd-field-label" htmlFor="specialist-generate-ai-report-from">
                {t("specialist.reports.generate.periodFrom")}
              </label>
              <input
                id="specialist-generate-ai-report-from"
                className="pd-input pd-specialist-treatment-plan-control pd-specialist-treatment-plan-date-input"
                type="date"
                value={periodStart}
                max={periodEnd || todayValue}
                onChange={(event) => {
                  setPeriodStart(event.target.value);
                  setLocalError(null);
                  onClearGenerationError?.();
                }}
                disabled={isGenerating}
                dir="ltr"
              />
            </div>
            <div className="pd-specialist-generate-ai-report-date-field">
              <label className="pd-field-label" htmlFor="specialist-generate-ai-report-to">
                {t("specialist.reports.generate.periodTo")}
              </label>
              <input
                id="specialist-generate-ai-report-to"
                className="pd-input pd-specialist-treatment-plan-control pd-specialist-treatment-plan-date-input"
                type="date"
                value={periodEnd}
                min={periodStart || undefined}
                max={todayValue}
                onChange={(event) => {
                  setPeriodEnd(event.target.value);
                  setLocalError(null);
                  onClearGenerationError?.();
                }}
                disabled={isGenerating}
                dir="ltr"
              />
            </div>
          </div>

          {displayError ? <p className="pd-inline-error">{displayError}</p> : null}

          <div className="pd-modal-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={() => onClose?.()}
              disabled={isGenerating}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="pd-btn pd-btn-primary"
              disabled={!canSubmit}
            >
              {isGenerating
                ? t("specialist.reports.generate.generating")
                : t("specialist.reports.generate.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
