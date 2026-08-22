import { useEffect, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { loadSpecialistPatients } from "../../../services/specialistPatientService";
import {
  REGULAR_REPORT_TYPES,
  REGULAR_REPORT_TYPE_VALUES,
} from "../utils/specialistRegularReportCreation";
import { mapSpecialistPatientList } from "../utils/specialistPatientMappers";

const TYPE_LABEL_KEYS = {
  [REGULAR_REPORT_TYPES.WEEKLY]: "specialist.reports.create.weekly",
  [REGULAR_REPORT_TYPES.MONTHLY]: "specialist.reports.create.monthly",
  [REGULAR_REPORT_TYPES.ASSESSMENT]: "specialist.reports.create.assessment",
  [REGULAR_REPORT_TYPES.PROGRESS]: "specialist.reports.create.progress",
};

export function SpecialistCreateReportDialog({
  open,
  onClose,
  specialistUserId,
  initialPatientId = null,
  isCreating = false,
  creationError = null,
  onClearCreationError,
  onCreate,
}) {
  const { t } = useLocale();
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [reportType, setReportType] = useState(REGULAR_REPORT_TYPES.WEEKLY);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [localError, setLocalError] = useState(null);

  const displayError = localError || creationError || patientsError;

  useEffect(() => {
    if (!open) {
      return;
    }

    setReportType(REGULAR_REPORT_TYPES.WEEKLY);
    setTitle("");
    setSummary("");
    setLocalError(null);
    setPatientsError(null);
    onClearCreationError?.();

    const scopedPatientId = initialPatientId?.trim() || "";
    setSelectedPatientId(scopedPatientId);
  }, [open, initialPatientId, onClearCreationError]);

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
        setPatientsError(
          error instanceof Error
            ? error.message
            : t("specialist.reports.create.loadPatientsFailed"),
        );
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
    if (nextType === reportType || isCreating) {
      return;
    }
    setReportType(nextType);
    setLocalError(null);
    onClearCreationError?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);
    onClearCreationError?.();

    const result = await onCreate?.({
      patientId: selectedPatientId,
      reportType,
      title,
      summary,
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
    && Boolean(reportType)
    && !isCreating
    && !isLoadingPatients
    && patients.length > 0;

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => !isCreating && onClose?.()}>
      <div
        className="pd-modal pd-specialist-create-report-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-create-report-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-create-report-title" className="pd-modal-title">
          {t("specialist.reports.create.title")}
        </h2>
        <p className="pd-section-sub pd-specialist-create-report-subtitle">
          {t("specialist.reports.create.subtitle")}
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="pd-field-label" htmlFor="specialist-create-report-patient">
            {t("specialist.reports.create.patient")}
          </label>
          <select
            id="specialist-create-report-patient"
            className="pd-specialist-treatment-plan-control pd-specialist-treatment-plan-select"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setLocalError(null);
              onClearCreationError?.();
            }}
            disabled={isCreating || isLoadingPatients || patients.length === 0}
          >
            <option value="">
              {isLoadingPatients
                ? t("specialist.reports.create.loadingPatients")
                : t("specialist.reports.create.selectPatient")}
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>

          {!isLoadingPatients && patients.length === 0 ? (
            <p className="pd-section-sub pd-specialist-create-report-hint">
              {t("specialist.reports.create.noPatients")}
            </p>
          ) : null}

          <span className="pd-field-label">{t("specialist.reports.create.reportType")}</span>
          <div
            className="pd-specialist-create-report-type-grid"
            role="group"
            aria-label={t("specialist.reports.create.reportType")}
          >
            {REGULAR_REPORT_TYPE_VALUES.map((typeValue) => (
              <button
                key={typeValue}
                type="button"
                className={`pd-specialist-sessions-segment${reportType === typeValue ? " is-active" : ""}`}
                onClick={() => handleReportTypeChange(typeValue)}
                disabled={isCreating}
                aria-pressed={reportType === typeValue}
              >
                {t(TYPE_LABEL_KEYS[typeValue])}
              </button>
            ))}
          </div>

          <label className="pd-field-label" htmlFor="specialist-create-report-title-input">
            {t("specialist.reports.create.titleLabel")}
          </label>
          <input
            id="specialist-create-report-title-input"
            className="pd-input pd-specialist-treatment-plan-control"
            type="text"
            value={title}
            maxLength={200}
            placeholder={t("specialist.reports.create.optionalPlaceholder")}
            onChange={(event) => {
              setTitle(event.target.value);
              setLocalError(null);
              onClearCreationError?.();
            }}
            disabled={isCreating}
          />

          <label className="pd-field-label" htmlFor="specialist-create-report-summary">
            {t("specialist.reports.create.summaryLabel")}
          </label>
          <textarea
            id="specialist-create-report-summary"
            className="pd-input pd-specialist-treatment-plan-control pd-specialist-create-report-summary"
            value={summary}
            rows={5}
            placeholder={t("specialist.reports.create.optionalPlaceholder")}
            onChange={(event) => {
              setSummary(event.target.value);
              setLocalError(null);
              onClearCreationError?.();
            }}
            disabled={isCreating}
          />

          {displayError ? <p className="pd-inline-error">{displayError}</p> : null}

          <div className="pd-modal-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={() => onClose?.()}
              disabled={isCreating}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="pd-btn pd-btn-primary"
              disabled={!canSubmit}
            >
              {isCreating
                ? t("specialist.reports.create.creating")
                : t("specialist.reports.create.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
