import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { DonutChart } from "../components/DonutChart";
import { StatusBadge } from "../components/StatusBadge";
import { UserProfileAvatar } from "../components/profile/UserProfileAvatar";

const PROGRESS_RING_SIZE = 208;

export function ChildProgressOverview({
  child,
  progress,
  summary,
  weeklyProgress,
  upcomingSession,
  animationKey,
  onViewFull,
}) {
  const [replayToken, setReplayToken] = useState(0);

  const handleRingHover = () => {
    setReplayToken((value) => value + 1);
  };

  const completedToday = summary?.completed ?? 0;
  const totalToday = summary?.todaysExercises ?? 0;
  const completedLine = totalToday > 0
    ? `${completedToday} of ${totalToday} exercises completed today`
    : weeklyProgress?.completedCount > 0
      ? `${weeklyProgress.completedCount} exercises completed this week`
      : null;

  const nextSessionLine = upcomingSession
    ? `${upcomingSession.dateLabel || upcomingSession.whenLabel?.split(" · ")[0] || "Upcoming"} · ${upcomingSession.timeLabel || upcomingSession.whenLabel?.split(" · ")[1] || ""}`.replace(/ · $/, "")
    : summary?.nextSessionDetail || summary?.nextSessionLabel || "No session scheduled";

  const nextSessionSpecialist = upcomingSession?.specialistName || null;

  return (
    <section className="pd-section-enter" aria-label="Overall progress">
      <div className="pd-progress-hero-card pd-progress-hero-card-static">
        <div className="pd-progress-hero-body">
          <div className="pd-progress-hero-profile">
            <UserProfileAvatar
              imageUrl={child?.profileImageUrl}
              initials={child?.initials || "?"}
              alt=""
              shellClassName="pd-avatar pd-progress-child-avatar"
              fallbackClassName="pd-avatar pd-progress-child-avatar"
              className="pd-avatar-photo"
            />

            <div className="pd-progress-child-identity">
              <h2 className="pd-progress-child-name">{child?.fullName || "Child"}</h2>
              <StatusBadge label="Rehabilitation Follow-up" tone="blue" />
            </div>

            <ul className="pd-progress-profile-info">
              <li>
                <PlatformMaterialIcon icon="trendingUp" size={15} />
                <span>
                  <strong>Overall Progress</strong>
                  {progress?.overallPercent ?? 0}%
                </span>
              </li>
              {completedLine ? (
                <li>
                  <CheckCircle2 size={15} aria-hidden="true" />
                  <span>{completedLine}</span>
                </li>
              ) : null}
              <li>
                <PlatformMaterialIcon icon="calendarDays" size={15} />
                <span>
                  <strong>Next session:</strong> {nextSessionLine}
                  {nextSessionSpecialist ? ` · ${nextSessionSpecialist}` : ""}
                </span>
              </li>
            </ul>

            <button type="button" className="pd-btn pd-btn-primary pd-progress-view-btn" onClick={onViewFull}>
              View Details
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="pd-progress-hero-visual">
            <div
              className="pd-progress-hero-ring"
              onMouseEnter={handleRingHover}
              role="img"
              aria-label={`Overall progress ${progress?.overallPercent ?? 0} percent`}
            >
              <DonutChart
                key={`${animationKey}-${replayToken}`}
                percent={progress?.overallPercent ?? 0}
                size={PROGRESS_RING_SIZE}
                animated
                animationKey={`${animationKey}-${replayToken}`}
                duration={1100}
                hideLabel
              />
            </div>
            <div className="pd-progress-ring-caption">
              <span className="pd-progress-ring-label">Overall Progress</span>
              <strong className="pd-progress-ring-value">{progress?.overallPercent ?? 0}%</strong>
              {progress.trendDelta ? (
                <em className="pd-progress-ring-delta">{progress.trendDelta}</em>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
