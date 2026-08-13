import {
  SpecialistSessionCalendar,
  SpecialistSessionCalendarDayList,
} from "../components/SpecialistSessionCalendar";

export function SpecialistSessionsCalendarView({
  visibleMonth,
  selectedDate,
  today,
  dayHasSessions,
  daySessions,
  onMonthChange,
  onSelectDate,
}) {
  return (
    <div className="pd-specialist-sessions-calendar-layout">
      <SpecialistSessionCalendar
        visibleMonth={visibleMonth}
        selectedDate={selectedDate}
        today={today}
        dayHasSessions={dayHasSessions}
        onMonthChange={onMonthChange}
        onSelectDate={onSelectDate}
      />
      <SpecialistSessionCalendarDayList
        selectedDate={selectedDate}
        sessions={daySessions}
      />
    </div>
  );
}
