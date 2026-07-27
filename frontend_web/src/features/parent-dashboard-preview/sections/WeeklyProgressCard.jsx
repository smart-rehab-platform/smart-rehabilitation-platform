import { Flame } from "lucide-react";
import { WeeklyBarChart } from "../components/WeeklyBarChart";

export function WeeklyProgressCard({ weekly }) {
  return (
    <section className="pd-card pd-card-pad pd-equal-card">
      <div className="pd-card-header pd-card-header-wrap">
        <div>
          <h2 className="pd-section-title">Weekly Progress</h2>
          <p className="pd-section-sub">Exercise Completion</p>
        </div>
        <button type="button" className="pd-range-pill" aria-label="Progress range">
          {weekly.rangeLabel}
        </button>
      </div>

      <div className="pd-weekly-stats">
        <span className="pd-streak">
          <Flame size={14} aria-hidden="true" />
          {weekly.streakDays}-day streak
        </span>
        <span>
          {weekly.completedCount} of {weekly.totalCount} completed
        </span>
      </div>

      <WeeklyBarChart days={weekly.days} />
    </section>
  );
}
