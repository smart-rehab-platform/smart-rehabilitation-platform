import { useMemo, useState } from "react";
import { Calendar, MapPin, Video } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import {
  formatSpecialistDurationMinutes,
  formatSpecialistSessionScheduleLabel,
  getDashboardWeekdayLabels,
  getSpecialistSessionStatusLabel,
} from "../utils/specialistDashboardLocalization";
import {
  buildWeeklyScheduleViewModel,
  getInitials,
  isSameDay,
} from "../utils/specialistScheduleUtils";

function SessionPreview({
  session,
  onViewSession,
  t,
  locale,
}) {
  if (!session) {
    return (
      <div className="pd-specialist-schedule-empty">
        <strong>{t("specialist.dashboard.schedule.noSessionsThisDayTitle")}</strong>
        <p>{t("specialist.dashboard.schedule.noSessionsThisDayHint")}</p>
      </div>
    );
  }

  const scheduleLabel = formatSpecialistSessionScheduleLabel(session, new Date(), { t, locale });
  const durationLabel = formatSpecialistDurationMinutes(session.durationMinutes, t);
  const statusLabel = getSpecialistSessionStatusLabel(session.status, t);

  return (
    <div className="pd-specialist-schedule-preview">
      <div className="pd-specialist-schedule-preview-main">
        <UserProfileAvatar
          imageUrl={session.patientProfileImageUrl}
          initials={getInitials(session.patientName)}
          alt={t("specialist.dashboard.schedule.patientPhotoAlt", { name: session.patientName })}
          shellClassName="pd-avatar pd-specialist-schedule-avatar"
          fallbackClassName="pd-avatar pd-specialist-schedule-avatar"
          className="pd-avatar-photo"
        />

        <div className="pd-specialist-schedule-copy">
          <span className="pd-specialist-schedule-eyebrow">{t("specialist.dashboard.schedule.nextSession")}</span>
          <strong className="pd-specialist-schedule-patient">{session.patientName}</strong>
          <span className="pd-specialist-schedule-time">{scheduleLabel}</span>
          <div className="pd-specialist-schedule-meta">
            {durationLabel ? <span>{durationLabel}</span> : null}
            <span className="pd-specialist-schedule-status">{statusLabel}</span>
          </div>
          {session.isOnline ? (
            <span className="pd-schedule-mode">
              <Video size={12} aria-hidden="true" />
              {t("specialist.dashboard.schedule.onlineMeeting")}
            </span>
          ) : session.physicalLocation ? (
            <span className="pd-schedule-mode">
              <MapPin size={12} aria-hidden="true" />
              {session.physicalLocation}
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="pd-btn pd-btn-soft pd-btn-sm"
        onClick={() => onViewSession?.(session)}
      >
        {t("specialist.dashboard.schedule.viewSession")}
      </button>
    </div>
  );
}

export function SpecialistWeeklySchedule({
  sessions = [],
  isLoading = false,
  error = null,
  onRetry,
  onViewCalendar,
  onViewSession,
}) {
  const { t, locale } = useLocale();
  const weekdayLabels = useMemo(() => getDashboardWeekdayLabels(locale), [locale]);
  const [selectedDay, setSelectedDay] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const viewModel = useMemo(
    () => buildWeeklyScheduleViewModel(sessions, selectedDay, new Date(), { t, locale }),
    [sessions, selectedDay, t, locale],
  );

  return (
    <section
      className="pd-card pd-card-pad pd-specialist-weekly-schedule pd-section-enter"
      aria-label={t("specialist.dashboard.schedule.ariaLabel")}
    >
      <div className="pd-specialist-weekly-header">
        <div>
          <h2 className="pd-section-title">{t("specialist.dashboard.schedule.title")}</h2>
          <p className="pd-section-sub">{t("specialist.dashboard.schedule.subtitle")}</p>
        </div>
        <button
          type="button"
          className="pd-link"
          onClick={onViewCalendar}
        >
          {t("specialist.dashboard.schedule.viewCalendar")}
        </button>
      </div>

      {isLoading ? (
        <p className="pd-inline-loading pd-specialist-weekly-loading">{t("specialist.dashboard.schedule.loading")}</p>
      ) : error ? (
        <div className="pd-specialist-weekly-error">
          <p className="pd-inline-error">{error}</p>
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={onRetry}
          >
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <>
          <div className="pd-specialist-week-strip" role="group" aria-label={t("specialist.dashboard.schedule.currentWeekAriaLabel")}>
            {viewModel.weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDay);
              const isToday = isSameDay(day, viewModel.today);
              const hasSession = viewModel.dayHasSession(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={`pd-specialist-week-day${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
                  aria-pressed={isSelected}
                  aria-label={t("specialist.dashboard.schedule.weekDayAriaLabel", {
                    weekday: weekdayLabels[index],
                    day: day.getDate(),
                    hasSessions: hasSession
                      ? t("specialist.dashboard.schedule.weekDayHasSessions")
                      : "",
                  })}
                  onClick={() => setSelectedDay(new Date(day))}
                >
                  <span className="pd-specialist-week-day-label">{weekdayLabels[index]}</span>
                  <span className="pd-specialist-week-day-num">{day.getDate()}</span>
                  <span
                    className={`pd-specialist-week-day-dot${hasSession ? "" : " is-empty"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {!viewModel.hasWeekSessions ? (
            <p className="pd-specialist-week-empty">
              {t("specialist.dashboard.schedule.emptyWeek")}
            </p>
          ) : null}

          <div className="pd-specialist-week-divider" aria-hidden="true" />

          <SessionPreview
            session={viewModel.previewSession}
            onViewSession={onViewSession}
            t={t}
            locale={locale}
          />

          <div className="pd-specialist-week-divider" aria-hidden="true" />

          <div className="pd-specialist-schedule-summary">
            <Calendar size={16} aria-hidden="true" />
            <span>{viewModel.summaryLabel}</span>
          </div>
        </>
      )}
    </section>
  );
}
