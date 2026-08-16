import { useMemo } from "react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
import { SIDEBAR_EXERCISES_ICON } from "../constants/parentSidebarIconAssets";

export function SummaryStrip({ summary, onNavigate }) {
  const { t } = useLocale();

  const segments = useMemo(() => ([
    {
      key: "tasks",
      navKey: "exercises",
      icon: SIDEBAR_EXERCISES_ICON,
      tone: "blue",
      label: t("parent.home.tasksLabel"),
      destination: t("parent.nav.exercises"),
      value: (s) => String(s.todaysExercises ?? 0),
    },
    {
      key: "session",
      navKey: "sessions",
      icon: "calendarDays",
      tone: "orange",
      label: t("parent.home.nextSession"),
      destination: t("parent.nav.sessions"),
      value: (s) => s.nextSessionLabel || "—",
    },
    {
      key: "progress",
      navKey: "progress",
      icon: "trendingUp",
      tone: "green",
      label: t("parent.home.overallProgress"),
      destination: t("parent.nav.progress"),
      value: (s) => s.overallProgress || "—",
    },
  ]), [t]);

  return (
    <section className="pd-quick-summary pd-section-enter" aria-label={t("parent.home.quickSummary")}>
      {segments.map((segment) => (
        <button
          key={segment.key}
          type="button"
          className={`pd-quick-summary-item pd-quick-summary-item--${segment.key}`}
          onClick={() => onNavigate?.(segment.navKey)}
          aria-label={t("parent.home.summaryNavigateAria", {
            label: segment.label,
            value: segment.value(summary),
            destination: segment.destination,
          })}
        >
          <span className={`pd-summary-icon pd-tone-${segment.tone}`} aria-hidden="true">
            <PlatformMaterialIcon icon={segment.icon} size={15} />
          </span>
          <span className="pd-quick-summary-copy">
            <span className="pd-summary-label">{segment.label}</span>
            <strong className="pd-summary-value">{segment.value(summary)}</strong>
          </span>
        </button>
      ))}
    </section>
  );
}
