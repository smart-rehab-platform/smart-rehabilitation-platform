import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale";
import {
  buildMonthGrid,
  isSameMonth,
  normalizeCalendarDate,
} from "../utils/specialistSessionMappers";
import { isSameDay } from "../utils/specialistScheduleUtils";
import {
  formatSessionCalendarDayHeading,
  formatSessionCalendarMonthYear,
  getCalendarDayEmptyMessage,
  getCalendarNextMonthLabel,
  getCalendarPreviousMonthLabel,
  getSessionCalendarWeekdayLabels,
} from "../utils/specialistSessionsLocalization";
import { SpecialistSessionCard } from "./SpecialistSessionCard";

export function SpecialistSessionCalendar({
  visibleMonth,
  selectedDate,
  today,
  dayHasSessions,
  onMonthChange,
  onSelectDate,
}) {
  const { t, locale } = useLocale();
  const monthDays = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const weekdayLabels = useMemo(() => getSessionCalendarWeekdayLabels(locale), [locale]);

  return (
    <section className="pd-card pd-card-pad pd-specialist-session-calendar">
      <div className="pd-specialist-session-calendar-header">
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-specialist-session-calendar-nav"
          onClick={() => onMonthChange(-1)}
          aria-label={getCalendarPreviousMonthLabel(t)}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h3 className="pd-specialist-session-calendar-title">
          {formatSessionCalendarMonthYear(visibleMonth, locale)}
        </h3>
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-specialist-session-calendar-nav"
          onClick={() => onMonthChange(1)}
          aria-label={getCalendarNextMonthLabel(t)}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="pd-specialist-session-calendar-weekdays">
        {weekdayLabels.map((label, index) => (
          <span key={index} className="pd-specialist-session-calendar-weekday">{label}</span>
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
              aria-label={formatSessionCalendarDayHeading(day, locale, t)}
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
  const { t, locale } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-specialist-session-calendar-day-list">
      <h3 className="pd-specialist-session-calendar-day-title">
        {formatSessionCalendarDayHeading(selectedDate, locale, t)}
      </h3>
      {sessions.length === 0 ? (
        <p className="pd-section-sub">{getCalendarDayEmptyMessage(t)}</p>
      ) : (
        <div className="pd-specialist-sessions-list">
          {sessions.map((session) => (
            <SpecialistSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </section>
  );
}
