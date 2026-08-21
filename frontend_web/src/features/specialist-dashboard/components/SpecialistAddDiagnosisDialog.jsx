import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  DIAGNOSIS_OPTION_OTHER,
  PREDEFINED_DIAGNOSIS_OPTIONS,
  buildInitialDiagnosisFormState,
  formatLocalDateInputValue,
  getDiagnosisOptionLabel,
  isDiagnosisSelectionUnchanged,
  resolveDiagnosisSelectorState,
  resolveEffectiveDiagnosisTitle,
  validateDiagnosisSelection,
} from "../utils/specialistDiagnosisOptions";

export function SpecialistAddDiagnosisDialog({
  open,
  onClose,
  onSubmit,
  isSaving,
  currentDiagnosis = null,
}) {
  const { t } = useLocale();
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [diagnosedAt, setDiagnosedAt] = useState(() => formatLocalDateInputValue());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectorState = resolveDiagnosisSelectorState(currentDiagnosis, t);
    const initial = buildInitialDiagnosisFormState(currentDiagnosis);
    setSelectedOptionId(selectorState.selectedOptionId);
    setCustomTitle(selectorState.customTitle);
    setDescription(initial.description);
    setDiagnosedAt(initial.diagnosedAt);
    setError(null);
  }, [open, currentDiagnosis, t]);

  const effectiveTitle = useMemo(
    () => resolveEffectiveDiagnosisTitle(selectedOptionId, customTitle),
    [selectedOptionId, customTitle],
  );

  const isUnchanged = useMemo(
    () => isDiagnosisSelectionUnchanged(
      currentDiagnosis,
      selectedOptionId,
      customTitle,
      description,
      diagnosedAt,
    ),
    [currentDiagnosis, selectedOptionId, customTitle, description, diagnosedAt],
  );

  const canSave = Boolean(selectedOptionId)
    && effectiveTitle.trim().length > 0
    && !isUnchanged
    && !isSaving;

  const showOtherInput = selectedOptionId === DIAGNOSIS_OPTION_OTHER;

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateDiagnosisSelection(selectedOptionId, customTitle, t);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!diagnosedAt.trim()) {
      setError(t("specialist.patientDetails.diagnosedDateRequired"));
      return;
    }

    if (isUnchanged) {
      onClose?.();
      return;
    }

    const trimmedTitle = resolveEffectiveDiagnosisTitle(selectedOptionId, customTitle);
    const result = await onSubmit?.({
      diagnosis_title: trimmedTitle,
      description: description.trim() || undefined,
      diagnosed_at: diagnosedAt.trim(),
    });

    if (result?.ok) {
      onClose?.();
      return;
    }

    setError(result?.message || t("specialist.patientDetails.saveDiagnosisFailed"));
  };

  return (
    <div className="pd-modal-backdrop" role="presentation" onClick={() => onClose?.()}>
      <div
        className="pd-modal pd-specialist-add-diagnosis-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialist-manage-diagnosis-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="specialist-manage-diagnosis-title" className="pd-modal-title">
          {t("specialist.patientDetails.manageDiagnosisTitle")}
        </h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="pd-field-label" htmlFor="specialist-diagnosis-option">
            {t("specialist.patientDetails.diagnosisSelectorLabel")}
          </label>
          <select
            id="specialist-diagnosis-option"
            className="pd-specialist-treatment-plan-control pd-specialist-treatment-plan-select pd-specialist-diagnosis-select"
            value={selectedOptionId}
            onChange={(event) => {
              setSelectedOptionId(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
          >
            <option value="">{t("specialist.patientDetails.selectDiagnosis")}</option>
            {PREDEFINED_DIAGNOSIS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {getDiagnosisOptionLabel(option.id, t)}
              </option>
            ))}
            <option value={DIAGNOSIS_OPTION_OTHER}>
              {getDiagnosisOptionLabel(DIAGNOSIS_OPTION_OTHER, t)}
            </option>
          </select>

          {showOtherInput ? (
            <>
              <label className="pd-field-label" htmlFor="specialist-diagnosis-other-title">
                {t("specialist.patientDetails.otherDiagnosisLabel")}
              </label>
              <input
                id="specialist-diagnosis-other-title"
                className="pd-input"
                type="text"
                name="specialist_new_diagnosis_title"
                autoComplete="off"
                value={customTitle}
                onChange={(event) => {
                  setCustomTitle(event.target.value);
                  setError(null);
                }}
                disabled={isSaving}
                dir="auto"
              />
            </>
          ) : null}

          <label className="pd-field-label" htmlFor="specialist-diagnosis-description">
            {t("specialist.patientDetails.diagnosisDescriptionLabel")}
          </label>
          <textarea
            id="specialist-diagnosis-description"
            className="pd-textarea"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSaving}
            dir="auto"
          />

          <label className="pd-field-label" htmlFor="specialist-diagnosis-date">
            {t("specialist.patientDetails.diagnosedDateLabel")}
          </label>
          <input
            id="specialist-diagnosis-date"
            className="pd-input pd-specialist-diagnosis-date-input"
            type="date"
            value={diagnosedAt}
            onChange={(event) => setDiagnosedAt(event.target.value)}
            disabled={isSaving}
            dir="ltr"
          />

          {error ? <p className="pd-inline-error">{error}</p> : null}
          <div className="pd-modal-actions">
            <button type="button" className="pd-btn pd-btn-soft" onClick={() => onClose?.()} disabled={isSaving}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={!canSave}>
              {isSaving ? t("specialist.patientDetails.savingNote") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
