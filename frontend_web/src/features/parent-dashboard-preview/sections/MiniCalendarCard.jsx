import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { MONTH_NAMES } from "../mock/parentDashboardMock";

function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function MiniCalendarCard({
  year,
  monthIndex,
  selectedDay,
  todayYear,
  todayMonthIndex,
  todayDay,
  sessionDays = [],
  exerciseDays = [],
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}) {
  const { t } = useLocale();
  const cells = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthLabel = `${MONTH_NAMES[monthIndex]} ${year}`;

  return (
    <section className="pd-calendar-minimal pd-section-enter" aria-label={t("parent.home.calendarFor", { monthLabel })}>
      <div className="pd-calendar-minimal-header">
        <h2 className="pd-overview-title">{monthLabel}</h2>
        <div className="pd-cal-nav">
          <button
            type="button"
            className="pd-icon-btn-sm"
            aria-label={t("parent.home.previousMonth")}
            onClick={onPrevMonth}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            className="pd-icon-btn-sm"
            aria-label={t("parent.home.nextMonth")}
            onClick={onNextMonth}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="pd-calendar">
        <div className="pd-cal-weekdays">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="pd-cal-grid">
          {cells.map((day, index) => {
            if (!day) {
              return <span key={`empty-${index}`} className="pd-cal-empty" />;
            }

            const isSelected = day === selectedDay;
            const isToday = year === todayYear
              && monthIndex === todayMonthIndex
              && day === todayDay;
            const hasSession = sessionDays.includes(day);
            const hasExercise = exerciseDays.includes(day);

            return (
              <button
                key={day}
                type="button"
                className={`pd-cal-day${isSelected ? " is-selected" : ""}${isToday && !isSelected ? " is-today" : ""}`}
                aria-label={`${monthLabel} ${day}`}
                aria-pressed={isSelected}
                onClick={() => onSelectDay?.(day)}
              >
                {day}
                {(hasSession || hasExercise) && (
                  <span className="pd-cal-dots" aria-hidden="true">
                    {hasSession ? <i className="session" /> : null}
                    {hasExercise ? <i className="exercise" /> : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pd-cal-legend">
        <span><i className="session" aria-hidden="true" /> {t("parent.home.sessionLegend")}</span>
        <span><i className="exercise" aria-hidden="true" /> {t("parent.home.exerciseLegend")}</span>
      </div>
    </section>
  );
}
