import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
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
  const { t } = useLocale();
  const [replayToken, setReplayToken] = useState(0);

  const handleRingHover = () => {
    setReplayToken((value) => value + 1);
  };

  const completedToday = summary?.completed ?? 0;
  const totalToday = summary?.todaysExercises ?? 0;
  const completedLine = totalToday > 0
    ? t("parent.home.exercisesCompletedToday", {
      completed: completedToday,
      total: totalToday,
    })
    : weeklyProgress?.completedCount > 0
      ? t("parent.home.exercisesCompletedThisWeek", {
        count: weeklyProgress.completedCount,
      })
      : null;

  const nextSessionLine = upcomingSession
    ? `${upcomingSession.dateLabel || upcomingSession.whenLabel?.split(" · ")[0] || t("parent.home.upcomingSession")} · ${upcomingSession.timeLabel || upcomingSession.whenLabel?.split(" · ")[1] || ""}`.replace(/ · $/, "")
    : summary?.nextSessionDetail || summary?.nextSessionLabel || t("parent.home.noSessionScheduled");

  const nextSessionSpecialist = upcomingSession?.specialistName || null;

  return (
    <section className="pd-section-enter" aria-label={t("parent.home.overallProgressAriaLabel")}>
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
              <h2 className="pd-progress-child-name">{child?.fullName || t("parent.common.child")}</h2>
              <StatusBadge label={t("parent.home.rehabilitationFollowUp")} tone="blue" />
            </div>

            <ul className="pd-progress-profile-info">
              <li>
                <PlatformMaterialIcon icon="trendingUp" size={15} />
                <span>
                  <strong>{t("parent.home.overallProgress")}</strong>
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
                  <strong>{t("parent.home.nextSessionLabel")}</strong> {nextSessionLine}
                  {nextSessionSpecialist ? ` · ${nextSessionSpecialist}` : ""}
                </span>
              </li>
            </ul>

            <button type="button" className="pd-btn pd-btn-primary pd-progress-view-btn" onClick={onViewFull}>
              {t("parent.home.viewDetails")}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="pd-progress-hero-visual">
            <div
              className="pd-progress-hero-ring"
              onMouseEnter={handleRingHover}
              role="img"
              aria-label={t("parent.home.overallProgressPercentAria", {
                percent: progress?.overallPercent ?? 0,
              })}
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
              <span className="pd-progress-ring-label">{t("parent.home.overallProgress")}</span>
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
