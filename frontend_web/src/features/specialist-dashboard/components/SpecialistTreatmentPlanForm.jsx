import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";
import {
  buildTreatmentPlanStatusOptions,
  getTreatmentPlanStatusLabel,
  resolveTreatmentPlanFieldErrors,
} from "../utils/specialistTreatmentPlansLocalization";
import { SpecialistTreatmentPlanPatientSummary } from "./SpecialistTreatmentPlanPatientSummary";

function fieldClassName(base, hasError) {
  return `${base}${hasError ? " has-error" : ""}`;
}

export function SpecialistTreatmentPlanPatientHeader({ patientName }) {
  return (
    <section className="pd-card pd-specialist-treatment-plan-patient-card">
      <UserProfileAvatar
        imageUrl={null}
        initials={getInitials(patientName, "P")}
        alt=""
        shellClassName="pd-avatar pd-specialist-treatment-plan-patient-avatar"
        fallbackClassName="pd-avatar pd-specialist-treatment-plan-patient-avatar"
        className="pd-avatar-photo"
      />
      <strong className="pd-specialist-treatment-plan-patient-name" dir="auto">{patientName}</strong>
    </section>
  );
}

export function SpecialistTreatmentPlanForm({
  mode,
  patientName,
  patientAge = null,
  profileImageUrl = null,
  overallProgressPercent = null,
  planStatusLabel,
  planStatusTone = "success",
  title,
  status,
  startDate,
  endDate,
  isSaving,
  validationMessage,
  errorMessage,
  showStatusSelector = true,
  showActiveBadge = false,
  showPatientSelector = false,
  patients = [],
  selectedPatientId,
  isPatientLocked = false,
  onTitleChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onPatientChange,
  onSubmit,
  onCancel,
  beforeActions = null,
  showPatientSummary = true,
}) {
  const { t } = useLocale();
  const isDesktopLayout = mode === "edit" || mode === "create";
  const isCreateMode = mode === "create";
  const hasSelectedPatient = isPatientLocked || Boolean(String(selectedPatientId || "").trim());
  const fieldErrors = useMemo(
    () => resolveTreatmentPlanFieldErrors(validationMessage, t),
    [validationMessage, t],
  );
  const statusOptions = useMemo(() => buildTreatmentPlanStatusOptions(t), [t]);
  const activeStatusLabel = getTreatmentPlanStatusLabel("active", t);

  const submitLabel = isSaving
    ? (mode === "create" ? t("specialist.treatmentPlans.creating") : t("specialist.treatmentPlans.saving"))
    : (mode === "create" ? t("specialist.treatmentPlans.createPlan") : t("specialist.treatmentPlans.saveChanges"));

  const planTitleField = (
    <div className={fieldClassName("pd-specialist-treatment-plan-field", fieldErrors.title)}>
      <label className="pd-specialist-treatment-plan-label" htmlFor="treatment-plan-title">
        {t("specialist.treatmentPlans.fields.planTitle")}
      </label>
      <input
        id="treatment-plan-title"
        type="text"
        className="pd-specialist-treatment-plan-control"
        value={title}
        onChange={(event) => onTitleChange?.(event.target.value)}
        placeholder={t("specialist.treatmentPlans.fields.planTitlePlaceholder")}
        disabled={isSaving}
        aria-invalid={Boolean(fieldErrors.title)}
        dir="auto"
      />
      {fieldErrors.title ? (
        <p className="pd-specialist-treatment-plan-error">{fieldErrors.title}</p>
      ) : null}
    </div>
  );

  const statusField = showStatusSelector ? (
    <div className="pd-specialist-treatment-plan-field">
      <span className="pd-specialist-treatment-plan-label">{t("specialist.treatmentPlans.fields.status")}</span>
      <div
        className="pd-specialist-treatment-plan-status-group"
        role="group"
        aria-label={t("specialist.treatmentPlans.fields.statusAriaLabel")}
      >
        {statusOptions.map((option) => {
          const isSelected = status === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`pd-specialist-treatment-plan-status-chip${isSelected ? " is-selected" : ""}`}
              onClick={() => onStatusChange?.(option.id)}
              aria-pressed={isSelected}
              disabled={isSaving}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  const createStatusInfo = showActiveBadge ? (
    <div className="pd-specialist-treatment-plan-field">
      <span className="pd-specialist-treatment-plan-label">{t("specialist.treatmentPlans.fields.status")}</span>
      <div className="pd-specialist-treatment-plan-status-info">
        <span className="pd-specialist-treatment-plan-status-pill">{activeStatusLabel}</span>
        <p className="pd-specialist-treatment-plan-status-note">
          {t("specialist.treatmentPlans.status.newPlanHelper")}
        </p>
      </div>
    </div>
  ) : null;

  const dateFields = (
    <div className="pd-specialist-treatment-plan-date-grid">
      <div className={fieldClassName("pd-specialist-treatment-plan-field", fieldErrors.startDate)}>
        <label className="pd-specialist-treatment-plan-label" htmlFor="treatment-plan-start-date">
          {t("specialist.treatmentPlans.fields.startDate")}
        </label>
        <div className="pd-specialist-treatment-plan-date-wrap">
          <input
            id="treatment-plan-start-date"
            type="date"
            className="pd-specialist-treatment-plan-control pd-specialist-treatment-plan-date-input"
            value={startDate}
            onChange={(event) => onStartDateChange?.(event.target.value)}
            disabled={isSaving}
            aria-invalid={Boolean(fieldErrors.startDate)}
            dir="ltr"
          />
        </div>
        {fieldErrors.startDate ? (
          <p className="pd-specialist-treatment-plan-error">{fieldErrors.startDate}</p>
        ) : null}
      </div>

      <div className={fieldClassName("pd-specialist-treatment-plan-field", fieldErrors.endDate)}>
        <label className="pd-specialist-treatment-plan-label" htmlFor="treatment-plan-end-date">
          {t("specialist.treatmentPlans.fields.endDate")}
        </label>
        <div className="pd-specialist-treatment-plan-end-date">
          <div className="pd-specialist-treatment-plan-date-wrap">
            <input
              id="treatment-plan-end-date"
              type="date"
              className="pd-specialist-treatment-plan-control pd-specialist-treatment-plan-date-input"
              value={endDate}
              onChange={(event) => onEndDateChange?.(event.target.value)}
              disabled={isSaving}
              aria-invalid={Boolean(fieldErrors.endDate)}
              dir="ltr"
            />
          </div>
          {endDate ? (
            <button
              type="button"
              className="pd-btn pd-btn-ghost pd-btn-sm pd-specialist-treatment-plan-clear-date"
              onClick={() => onEndDateChange?.("")}
              disabled={isSaving}
            >
              {t("specialist.treatmentPlans.fields.clearDate")}
            </button>
          ) : null}
        </div>
        {fieldErrors.endDate ? (
          <p className="pd-specialist-treatment-plan-error">{fieldErrors.endDate}</p>
        ) : null}
      </div>
    </div>
  );

  const patientSelectField = (
    <div className={fieldClassName("pd-specialist-treatment-plan-field", fieldErrors.patient)}>
      <label className="pd-specialist-treatment-plan-label" htmlFor="treatment-plan-patient">
        {t("specialist.treatmentPlans.fields.patient")}
      </label>
      <select
        id="treatment-plan-patient"
        className="pd-specialist-treatment-plan-control pd-specialist-treatment-plan-select"
        value={selectedPatientId}
        onChange={(event) => {
          const nextId = event.target.value;
          const patient = patients.find((item) => item.id === nextId);
          onPatientChange?.(patient || { id: nextId, name: "Patient" });
        }}
        disabled={isSaving}
        aria-invalid={Boolean(fieldErrors.patient)}
      >
        <option value="">{t("specialist.treatmentPlans.fields.selectPatient")}</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
      {fieldErrors.patient ? (
        <p className="pd-specialist-treatment-plan-error">{fieldErrors.patient}</p>
      ) : null}
    </div>
  );

  const renderPatientSection = () => {
    if (showPatientSelector && !isPatientLocked && !hasSelectedPatient) {
      return (
        <section className="pd-card pd-specialist-treatment-plan-patient-select-card">
          <h2 className="pd-specialist-treatment-plan-context-label">{t("specialist.treatmentPlans.fields.patient")}</h2>
          {patientSelectField}
        </section>
      );
    }

    if (mode === "edit") {
      if (!showPatientSummary) {
        return null;
      }

      return (
        <SpecialistTreatmentPlanPatientSummary
          patientName={patientName || "Patient"}
          patientAge={patientAge}
          profileImageUrl={profileImageUrl}
          statusLabel={planStatusLabel}
          statusTone={planStatusTone}
          showProgress={false}
        />
      );
    }

    return (
      <section className="pd-specialist-treatment-plan-patient-context">
        <h2 className="pd-specialist-treatment-plan-context-label">{t("specialist.treatmentPlans.fields.patient")}</h2>
        <div className="pd-card pd-specialist-treatment-plan-patient-context-card">
          <div className="pd-specialist-treatment-plan-patient-context-main">
            <UserProfileAvatar
              imageUrl={null}
              initials={getInitials(patientName || "Patient", "P")}
              alt=""
              shellClassName="pd-avatar pd-specialist-treatment-plan-patient-context-avatar"
              fallbackClassName="pd-avatar pd-specialist-treatment-plan-patient-context-avatar"
              className="pd-avatar-photo"
            />
            <div className="pd-specialist-treatment-plan-patient-context-copy">
              <strong className="pd-specialist-treatment-plan-patient-name" dir="auto">{patientName || "Patient"}</strong>
              <p className="pd-specialist-treatment-plan-patient-context-subtitle">
                {t("specialist.treatmentPlans.fields.assignedPatient")}
              </p>
            </div>
          </div>
          <span className="pd-specialist-treatment-plan-status-pill">{activeStatusLabel}</span>
        </div>
      </section>
    );
  };

  const resolvedFormError = fieldErrors.form || null;

  const feedback = (
    <>
      {resolvedFormError ? (
        <p className="pd-specialist-treatment-plan-error">{resolvedFormError}</p>
      ) : null}
      {errorMessage ? (
        <div className="pd-specialist-treatment-plan-inline-error">
          <p className="pd-specialist-treatment-plan-error">{errorMessage}</p>
        </div>
      ) : null}
    </>
  );

  const actions = (
    <div className={`pd-specialist-treatment-plan-actions${isDesktopLayout ? " pd-specialist-treatment-plan-actions--desktop" : ""}`}>
      {isDesktopLayout ? (
        <>
          <button
            type="button"
            className="pd-btn pd-btn-outline pd-specialist-treatment-plan-cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="pd-btn pd-btn-primary pd-specialist-treatment-plan-submit"
            disabled={isSaving}
          >
            {submitLabel}
          </button>
        </>
      ) : (
        <>
          <button
            type="submit"
            className="pd-btn pd-btn-primary pd-specialist-treatment-plan-submit"
            disabled={isSaving}
          >
            {submitLabel}
          </button>
          <button
            type="button"
            className="pd-btn pd-btn-outline pd-specialist-treatment-plan-cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t("common.cancel")}
          </button>
        </>
      )}
    </div>
  );

  const infoCard = (
    <section className="pd-card pd-specialist-treatment-plan-info-card">
      <h2 className="pd-specialist-treatment-plan-info-title">{t("specialist.treatmentPlans.fields.planInformation")}</h2>
      {planTitleField}
      {mode === "create" ? createStatusInfo : statusField}
      {dateFields}
      {isCreateMode ? (
        <>
          {feedback}
          <div className="pd-specialist-treatment-plan-info-actions">
            {actions}
          </div>
        </>
      ) : null}
    </section>
  );

  return (
    <form
      className={`pd-specialist-treatment-plan-form${isDesktopLayout ? " pd-specialist-treatment-plan-form--desktop" : ""}${isCreateMode ? " pd-specialist-treatment-plan-form--create" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      {isDesktopLayout ? (
        <div className="pd-specialist-treatment-plan-edit-stack">
          {renderPatientSection()}
          {infoCard}
        </div>
      ) : (
        <>
          {renderPatientSection()}
          {createStatusInfo}
          {planTitleField}
          {statusField}
          {dateFields}
        </>
      )}

      {!isCreateMode ? beforeActions : null}
      {!isCreateMode ? feedback : null}
      {!isCreateMode ? actions : null}
    </form>
  );
}
