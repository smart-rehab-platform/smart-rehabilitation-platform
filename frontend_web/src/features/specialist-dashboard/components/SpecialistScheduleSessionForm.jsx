import { Calendar, Clock } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import {
  getMaxScheduleDateValue,
  getTodayDateInputValue,
} from "../utils/specialistScheduleSessionMappers";
import { SpecialistScheduleSessionPatientSelect } from "./SpecialistScheduleSessionPatientSelect";

function fieldClassName(base, hasError) {
  return `${base}${hasError ? " has-error" : ""}`;
}

export function SpecialistScheduleSessionForm({
  patients = [],
  selectedPatient = null,
  title,
  scheduledDate,
  scheduledTime,
  duration,
  locationOrLink,
  sessionNotes,
  isSaving = false,
  isLoadingPatients = false,
  fieldErrors = {},
  errorMessage = null,
  onTitleChange,
  onScheduledDateChange,
  onScheduledTimeChange,
  onDurationChange,
  onLocationOrLinkChange,
  onSessionNotesChange,
  onPatientSelect,
  onSubmit,
  onCancel,
}) {
  const { t } = useLocale();
  const minDate = getTodayDateInputValue();
  const maxDate = getMaxScheduleDateValue();
  const submitDisabled = isSaving || isLoadingPatients || patients.length === 0;
  const hasDateTimeError = Boolean(fieldErrors.dateTime);

  return (
    <form
      className="pd-specialist-schedule-session-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <section className="pd-card pd-specialist-schedule-session-card">
        {isLoadingPatients ? (
          <p className="pd-inline-loading">{t("specialist.sessions.schedule.loadingPatients")}</p>
        ) : null}

        {!isLoadingPatients && patients.length === 0 ? (
          <div className="pd-specialist-schedule-session-empty">
            <p className="pd-section-sub">
              {t("specialist.sessions.schedule.noAssignedPatients")}
            </p>
          </div>
        ) : null}

        {!isLoadingPatients && patients.length > 0 ? (
          <div className="pd-specialist-schedule-session-grid">
            <div className="pd-specialist-schedule-session-column">
              <div className={fieldClassName("pd-specialist-schedule-session-field", fieldErrors.patientId)}>
                <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-patient">
                  {t("specialist.sessions.schedule.patient")}
                </label>
                <SpecialistScheduleSessionPatientSelect
                  patients={patients}
                  selectedPatient={selectedPatient}
                  disabled={isSaving}
                  error={fieldErrors.patientId}
                  onSelect={onPatientSelect}
                />
              </div>

              <div className={fieldClassName("pd-specialist-schedule-session-field", fieldErrors.title)}>
                <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-title">
                  {t("specialist.sessions.schedule.sessionTypeTitle")}
                </label>
                <input
                  id="schedule-session-title"
                  type="text"
                  className="pd-specialist-schedule-session-control"
                  value={title}
                  onChange={(event) => onTitleChange?.(event.target.value)}
                  placeholder={t("specialist.sessions.schedule.sessionTypePlaceholder")}
                  disabled={isSaving}
                  aria-invalid={Boolean(fieldErrors.title)}
                  dir="auto"
                />
                {fieldErrors.title ? (
                  <p className="pd-specialist-schedule-session-error">{fieldErrors.title}</p>
                ) : null}
              </div>

              <div className={fieldClassName("pd-specialist-schedule-session-field", fieldErrors.duration)}>
                <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-duration">
                  {t("specialist.sessions.schedule.duration")}
                </label>
                <div className="pd-specialist-schedule-session-duration-wrap">
                  <input
                    id="schedule-session-duration"
                    type="number"
                    min="1"
                    max="480"
                    inputMode="numeric"
                    className="pd-specialist-schedule-session-control pd-specialist-schedule-session-control--duration"
                    value={duration}
                    onChange={(event) => onDurationChange?.(event.target.value)}
                    placeholder="45"
                    disabled={isSaving}
                    aria-invalid={Boolean(fieldErrors.duration)}
                  />
                  <span className="pd-specialist-schedule-session-duration-suffix" aria-hidden="true">
                    {t("specialist.sessions.schedule.durationUnit")}
                  </span>
                </div>
                {fieldErrors.duration ? (
                  <p className="pd-specialist-schedule-session-error">{fieldErrors.duration}</p>
                ) : null}
              </div>
            </div>

            <div className="pd-specialist-schedule-session-column">
              <div className={fieldClassName("pd-specialist-schedule-session-field", hasDateTimeError)}>
                <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-date">
                  {t("specialist.sessions.schedule.date")}
                </label>
                <div className="pd-specialist-schedule-session-input-wrap">
                  <input
                    id="schedule-session-date"
                    type="date"
                    className="pd-specialist-schedule-session-control pd-specialist-schedule-session-date-input"
                    value={scheduledDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(event) => onScheduledDateChange?.(event.target.value)}
                    disabled={isSaving}
                    aria-invalid={hasDateTimeError}
                  />
                  <Calendar
                    size={18}
                    aria-hidden="true"
                    className="pd-specialist-schedule-session-input-icon"
                  />
                </div>
              </div>

              <div className={fieldClassName("pd-specialist-schedule-session-field", hasDateTimeError)}>
                <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-time">
                  {t("specialist.sessions.schedule.startTime")}
                </label>
                <div className="pd-specialist-schedule-session-input-wrap">
                  <input
                    id="schedule-session-time"
                    type="time"
                    className="pd-specialist-schedule-session-control pd-specialist-schedule-session-time-input"
                    value={scheduledTime}
                    onChange={(event) => onScheduledTimeChange?.(event.target.value)}
                    disabled={isSaving}
                    aria-invalid={hasDateTimeError}
                  />
                  <Clock
                    size={18}
                    aria-hidden="true"
                    className="pd-specialist-schedule-session-input-icon"
                  />
                </div>
                {fieldErrors.dateTime ? (
                  <p className="pd-specialist-schedule-session-error">{fieldErrors.dateTime}</p>
                ) : null}
              </div>

              <div className="pd-specialist-schedule-session-field">
                <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-location">
                  {t("specialist.sessions.schedule.locationOrLink")}
                </label>
                <input
                  id="schedule-session-location"
                  type="text"
                  className="pd-specialist-schedule-session-control"
                  value={locationOrLink}
                  onChange={(event) => onLocationOrLinkChange?.(event.target.value)}
                  placeholder={t("specialist.sessions.schedule.locationHint")}
                  disabled={isSaving}
                  dir="auto"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="pd-specialist-schedule-session-field pd-specialist-schedule-session-notes">
          <label className="pd-specialist-schedule-session-label" htmlFor="schedule-session-notes">
            {t("specialist.sessions.schedule.notesOptional")}
          </label>
          <textarea
            id="schedule-session-notes"
            className="pd-specialist-schedule-session-control pd-specialist-schedule-session-textarea"
            rows={4}
            value={sessionNotes}
            onChange={(event) => onSessionNotesChange?.(event.target.value)}
            placeholder={t("specialist.sessions.schedule.notesPlaceholder")}
            disabled={isSaving}
            dir="auto"
          />
          <p className="pd-specialist-schedule-session-helper">
            {t("specialist.sessions.schedule.formHelper")}
          </p>
        </div>

        {errorMessage ? (
          <p className="pd-specialist-schedule-session-error pd-specialist-schedule-session-api-error">{errorMessage}</p>
        ) : null}

        <div className="pd-specialist-schedule-session-actions">
          <button
            type="button"
            className="pd-btn pd-btn-outline pd-specialist-schedule-session-cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="pd-btn pd-btn-primary pd-specialist-schedule-session-submit"
            disabled={submitDisabled}
          >
            {isSaving
              ? t("specialist.sessions.schedule.scheduling")
              : t("specialist.sessions.schedule.scheduleSession")}
          </button>
        </div>
      </section>
    </form>
  );
}
