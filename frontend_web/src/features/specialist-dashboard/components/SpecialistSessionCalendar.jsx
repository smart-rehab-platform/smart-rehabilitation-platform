import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
  buildMonthGrid,
  formatCalendarDayHeading,
  formatCalendarLocationLabel,
  formatMonthYear,
  isSameMonth,
  normalizeCalendarDate,
} from "../utils/specialistSessionMappers";
import { isSameDay } from "../utils/specialistScheduleUtils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SpecialistSessionCalendar({
  visibleMonth,
  selectedDate,
  today,
  dayHasSessions,
  onMonthChange,
  onSelectDate,
}) {
  const monthDays = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  return (
    <section className="pd-card pd-card-pad pd-specialist-session-calendar">
      <div className="pd-specialist-session-calendar-header">
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-specialist-session-calendar-nav"
          onClick={() => onMonthChange(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h3 className="pd-specialist-session-calendar-title">{formatMonthYear(visibleMonth)}</h3>
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-specialist-session-calendar-nav"
          onClick={() => onMonthChange(1)}
          aria-label="Next month"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="pd-specialist-session-calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="pd-specialist-session-calendar-weekday">{label}</span>
        ))}
      </div>

      <div className="pd-specialist-session-calendar-grid">
        {monthDays.map((day) => {
          const inMonth = isSameMonth(day, visibleMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const hasSessions = inMonth && dayHasSessions(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              className={[
                "pd-specialist-session-calendar-day",
                inMonth ? "" : "is-outside",
                isSelected ? "is-selected" : "",
                isToday ? "is-today" : "",
              ].filter(Boolean).join(" ")}
              disabled={!inMonth}
              onClick={() => onSelectDate(normalizeCalendarDate(day))}
              aria-label={formatCalendarDayHeading(day)}
            >
              <span>{day.getDate()}</span>
              {hasSessions ? <span className="pd-specialist-session-calendar-dot" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SpecialistSessionCalendarDayList({
  selectedDate,
  sessions,
}) {
  return (
    <section className="pd-card pd-card-pad pd-specialist-session-calendar-day-list">
      <h3 className="pd-specialist-session-calendar-day-title">
        {formatCalendarDayHeading(selectedDate)}
      </h3>
      {sessions.length === 0 ? (
        <p className="pd-section-sub">No sessions scheduled for this date.</p>
      ) : (
        <ul className="pd-specialist-session-calendar-day-items">
          {sessions.map((session) => (
            <li key={session.id} className="pd-specialist-session-calendar-day-item">
              <strong>{session.patientName}</strong>
              <span>
                {session.timeLabel}
                {" • "}
                {session.durationMinutes ? `${session.durationMinutes} min` : "—"}
                {" • "}
                {formatCalendarLocationLabel(session)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
