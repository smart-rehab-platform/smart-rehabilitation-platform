import { useMemo, useState } from "react";
import { Calendar, MapPin, Video } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import {
  buildWeeklyScheduleViewModel,
  formatSessionScheduleLabel,
  getInitials,
  isSameDay,
} from "../utils/specialistScheduleUtils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SessionPreview({
  session,
  onViewSession,
}) {
  if (!session) {
    return (
      <div className="pd-specialist-schedule-empty">
        <strong>No sessions scheduled for this day.</strong>
        <p>Scheduled sessions will appear here when assigned.</p>
      </div>
    );
  }

  const scheduleLabel = formatSessionScheduleLabel(session);
  const durationLabel = session.durationMinutes
    ? `${session.durationMinutes} min`
    : null;
  const statusLabel = session.status
    ? session.status.replace(/_/g, " ")
    : "scheduled";

  return (
    <div className="pd-specialist-schedule-preview">
      <div className="pd-specialist-schedule-preview-main">
        <UserProfileAvatar
          imageUrl={session.patientProfileImageUrl}
          initials={getInitials(session.patientName)}
          alt={`${session.patientName} profile photo`}
          shellClassName="pd-avatar pd-specialist-schedule-avatar"
          fallbackClassName="pd-avatar pd-specialist-schedule-avatar"
          className="pd-avatar-photo"
        />

        <div className="pd-specialist-schedule-copy">
          <span className="pd-specialist-schedule-eyebrow">Next Session</span>
          <strong className="pd-specialist-schedule-patient">{session.patientName}</strong>
          <span className="pd-specialist-schedule-time">{scheduleLabel}</span>
          <div className="pd-specialist-schedule-meta">
            {durationLabel ? <span>{durationLabel}</span> : null}
            <span className="pd-specialist-schedule-status">{statusLabel}</span>
          </div>
          {session.isOnline ? (
            <span className="pd-schedule-mode">
              <Video size={12} aria-hidden="true" />
              Online meeting
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
        View Session
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
  const [selectedDay, setSelectedDay] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const viewModel = useMemo(
    () => buildWeeklyScheduleViewModel(sessions, selectedDay),
    [sessions, selectedDay],
  );

  return (
    <section
      className="pd-card pd-card-pad pd-specialist-weekly-schedule pd-section-enter"
      aria-label="Weekly schedule"
    >
      <div className="pd-specialist-weekly-header">
        <div>
          <h2 className="pd-section-title">Weekly Schedule</h2>
          <p className="pd-section-sub">Your sessions for this week</p>
        </div>
        <button
          type="button"
          className="pd-link"
          onClick={onViewCalendar}
        >
          View Calendar →
        </button>
      </div>

      {isLoading ? (
        <p className="pd-inline-loading pd-specialist-weekly-loading">Loading schedule...</p>
      ) : error ? (
        <div className="pd-specialist-weekly-error">
          <p className="pd-inline-error">{error}</p>
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="pd-specialist-week-strip" role="group" aria-label="Current week">
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
                  aria-label={`${WEEKDAY_LABELS[index]} ${day.getDate()}${hasSession ? ", has sessions" : ""}`}
                  onClick={() => setSelectedDay(new Date(day))}
                >
                  <span className="pd-specialist-week-day-label">{WEEKDAY_LABELS[index]}</span>
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
              No sessions are scheduled this week.
            </p>
          ) : null}

          <div className="pd-specialist-week-divider" aria-hidden="true" />

          <SessionPreview
            session={viewModel.previewSession}
            onViewSession={onViewSession}
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
