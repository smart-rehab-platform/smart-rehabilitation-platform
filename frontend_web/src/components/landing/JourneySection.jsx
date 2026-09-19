import { useMemo } from "react";
import {
  Activity,
  Bell,
  Calendar,
  Check,
  MessageSquare,
  Mic,
  TrendingUp,
} from "lucide-react";
import neurologyIcon from "../../assets/icons/neurology.svg";
import { useLocale } from "../../context/useLocale.js";
import {
  buildLandingAiWidgets,
  buildLandingWorkflowSteps,
} from "./landingLocalization.js";
import { L } from "./landingTokens";

const PROGRESS_PERCENT = 67;
const CURRENT_STEP_INDEX = 4;

const AI_WIDGET_ICON_MAP = {
  mic: Mic,
  activity: Activity,
  trendingUp: TrendingUp,
};

const cardStyle = {
  background: L.bgCard,
  border: `1px solid ${L.journeyCardBorder}`,
  boxShadow: L.journeyFloatShadow,
};

function CircularProgress({ value, size = 72 }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(42, 164, 201, 0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={L.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className="absolute text-base font-bold"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        {value}%
      </span>
    </div>
  );
}

function FloatWrap({ children, floatClass }) {
  return <div className={floatClass}>{children}</div>;
}

function PatientJourneyCard({ t, workflowSteps }) {
  return (
    <article
      aria-label={t("landing.journey.preview.patientJourney.ariaLabel")}
      className="journey-float-card journey-float-card-main w-full max-w-[460px] rounded-2xl p-5 transition-all duration-300 md:p-6"
      style={cardStyle}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h3
          className="text-[17px] font-semibold"
          style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
        >
          {t("landing.journey.preview.patientJourney.title")}
        </h3>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{
            background: L.badgeBg,
            color: L.badgeText,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {t("landing.journey.preview.patientJourney.badge")}
        </span>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
            {t("landing.journey.preview.patientJourney.progress")}
          </span>
          <span style={{ color: L.primarySecondary, fontFamily: "'Inter', sans-serif" }}>
            {PROGRESS_PERCENT}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(42, 164, 201, 0.12)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${PROGRESS_PERCENT}%`, background: L.gradientButton }}
          />
        </div>
      </div>

      <ol className="journey-steps-scroll flex max-h-[420px] flex-col gap-2 overflow-y-auto pe-1 md:max-h-[460px]">
        {workflowSteps.map((step, index) => {
          const isCurrent = index === CURRENT_STEP_INDEX;
          const isComplete = index < CURRENT_STEP_INDEX;
          const isPending = index > CURRENT_STEP_INDEX;

          return (
            <li
              key={step.key}
              className="rounded-xl px-3 py-2.5"
              style={{
                background: isCurrent ? L.primary : "transparent",
                border: isCurrent
                  ? `1px solid ${L.primary}`
                  : `1px solid ${isPending ? "rgba(44, 79, 121, 0.2)" : L.journeyCardBorder}`,
              }}
            >
              <div className="flex gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    background: isCurrent
                      ? "rgba(255, 255, 255, 0.2)"
                      : isComplete
                        ? L.primary
                        : "rgba(143, 163, 188, 0.2)",
                    color: isPending ? L.textLight : L.text,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {isComplete || isCurrent ? <Check size={11} strokeWidth={3} /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className="text-[13px] font-semibold leading-snug"
                    style={{
                      color: isCurrent ? L.text : isPending ? L.textLight : L.text,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="mt-1 text-[11px] leading-relaxed"
                    style={{
                      color: isCurrent ? "rgba(255,255,255,0.88)" : isPending ? L.textLight : L.textMuted,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function AiProgressPreview({ t, aiWidgets }) {
  return (
    <article
      aria-label={t("landing.journey.preview.aiReport.ariaLabel")}
      className="journey-float-card w-full max-w-[240px] rounded-2xl p-4 transition-all duration-300"
      style={{ ...cardStyle, opacity: 0.96 }}
    >
      <h3
        className="mb-3 text-[13px] font-semibold"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        {t("landing.journey.preview.aiReport.title")}
      </h3>
      <div className="mb-3 flex justify-center">
        <CircularProgress value={92} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {aiWidgets.map((widget) => {
          const Icon = AI_WIDGET_ICON_MAP[widget.icon];

          return (
            <div
              key={widget.key}
              className="rounded-lg px-2 py-1.5"
              style={{ background: L.accentMuted, border: `1px solid ${L.journeyCardBorder}` }}
            >
              {widget.iconSrc ? (
                <img
                  src={neurologyIcon}
                  alt=""
                  aria-hidden="true"
                  style={{ width: 12, height: 12, display: "block", objectFit: "contain" }}
                />
              ) : (
                Icon && <Icon size={12} style={{ color: L.primarySecondary }} aria-hidden="true" />
              )}
              <p
                className="mt-0.5 text-[9px] leading-tight"
                style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
              >
                {widget.label}
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function ParentDashboardPreview({ t }) {
  const dashboardItems = [
    {
      icon: Calendar,
      label: t("landing.journey.preview.parentDashboard.nextSession.label"),
      detail: t("landing.journey.preview.parentDashboard.nextSession.detail"),
    },
    {
      icon: MessageSquare,
      label: t("landing.journey.preview.parentDashboard.specialistFeedback.label"),
      detail: t("landing.journey.preview.parentDashboard.specialistFeedback.detail"),
    },
    {
      icon: Bell,
      label: t("landing.journey.preview.parentDashboard.aiReminder.label"),
      detail: t("landing.journey.preview.parentDashboard.aiReminder.detail"),
    },
  ];

  return (
    <article
      aria-label={t("landing.journey.preview.parentDashboard.ariaLabel")}
      className="journey-float-card w-full max-w-[240px] rounded-2xl p-4 transition-all duration-300"
      style={{ ...cardStyle, opacity: 0.96 }}
    >
      <h3
        className="mb-3 text-[13px] font-semibold"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        {t("landing.journey.preview.parentDashboard.title")}
      </h3>

      <div
        className="mb-3 rounded-lg p-2.5"
        style={{ background: L.accentMuted, border: `1px solid ${L.journeyCardBorder}` }}
      >
        <p className="text-[10px] font-medium" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
          {t("landing.journey.preview.parentDashboard.todaysExercises")}
        </p>
        <p className="mt-0.5 text-[12px] font-semibold" style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}>
          {t("landing.journey.preview.parentDashboard.exercisesStatus")}
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "rgba(42, 164, 201, 0.12)" }}>
          <div className="h-full w-2/3 rounded-full" style={{ background: L.primary }} />
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {dashboardItems.map(({ icon: Icon, label, detail }) => (
          <li
            key={label}
            className="flex items-start gap-2 rounded-lg px-2 py-1.5"
            style={{ background: "rgba(42, 164, 201, 0.06)" }}
          >
            <Icon size={12} className="mt-0.5 shrink-0" style={{ color: L.primarySecondary }} aria-hidden="true" />
            <div>
              <p className="text-[10px] font-medium" style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}>
                {label}
              </p>
              <p className="text-[9px] leading-snug" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
                {detail}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function JourneySection() {
  const { t } = useLocale();
  const workflowSteps = useMemo(() => buildLandingWorkflowSteps(t), [t]);
  const aiWidgets = useMemo(() => buildLandingAiWidgets(t), [t]);

  return (
    <section
      id="how-it-works"
      className="overflow-hidden px-5 py-16 md:py-20 lg:px-8 lg:py-24"
      style={{ background: L.sectionSoftBg }}
      aria-labelledby="journey-heading"
    >
      <header className="mx-auto mb-14 max-w-3xl text-center md:mb-16 lg:mb-20">
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] md:mb-4"
          style={{ color: L.primary, fontFamily: "'Inter', sans-serif" }}
        >
          {t("landing.journey.eyebrow")}
        </p>
        <h2
          id="journey-heading"
          className="text-[2.125rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
          style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
        >
          {t("landing.journey.heading")}
        </h2>
        <p
          className="mx-auto mt-5 max-w-[720px] text-[16px] leading-relaxed md:mt-6 md:text-[17px] lg:text-[18px]"
          style={{ color: L.journeyBody, fontFamily: "'Inter', sans-serif" }}
        >
          {t("landing.journey.description")}
        </p>
      </header>

      <div className="journey-showcase-group mx-auto w-full max-w-6xl overflow-x-clip">
        <div className="journey-showcase-inner relative mx-auto flex w-full max-w-[980px] flex-col items-center gap-5 pb-4 lg:block lg:min-h-[620px] lg:pb-0">
          <div className="journey-card-center relative z-30 order-1 flex w-full justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:order-none lg:w-auto lg:-translate-x-1/2 lg:-translate-y-1/2">
            <FloatWrap floatClass="journey-float journey-float-center">
              <PatientJourneyCard t={t} workflowSteps={workflowSteps} />
            </FloatWrap>
          </div>

          <div className="journey-card-sides order-2 flex w-full max-w-[460px] flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-center lg:contents">
            <div className="journey-card-left relative z-10 flex w-full justify-center sm:w-auto sm:flex-1 sm:max-w-[240px] lg:absolute lg:left-2 lg:top-2 lg:block lg:w-auto xl:left-6">
              <FloatWrap floatClass="journey-float journey-float-left">
                <AiProgressPreview t={t} aiWidgets={aiWidgets} />
              </FloatWrap>
            </div>

            <div className="journey-card-right relative z-20 flex w-full justify-center sm:w-auto sm:flex-1 sm:max-w-[240px] lg:absolute lg:bottom-4 lg:right-2 lg:block lg:w-auto xl:right-6">
              <FloatWrap floatClass="journey-float journey-float-right">
                <ParentDashboardPreview t={t} />
              </FloatWrap>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes journey-float-group {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes journey-float-left {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes journey-float-center {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes journey-float-right {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @media (min-width: 1024px) {
          .journey-showcase-group {
            animation: journey-float-group 8s ease-in-out infinite;
          }

          .journey-float-left {
            animation: journey-float-left 6.5s ease-in-out infinite;
            animation-delay: 0.3s;
          }

          .journey-float-center {
            animation: journey-float-center 5.5s ease-in-out infinite;
          }

          .journey-float-right {
            animation: journey-float-right 7s ease-in-out infinite;
            animation-delay: 0.8s;
          }
        }

        .journey-float-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        @media (hover: hover) {
          .journey-float-card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: ${L.journeyFloatShadowHover};
          }

          .journey-float-card-main:hover {
            transform: translateY(-8px) scale(1.02);
          }
        }

        .journey-steps-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .journey-steps-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .journey-steps-scroll::-webkit-scrollbar-thumb {
          background: rgba(42, 164, 201, 0.25);
          border-radius: 99px;
        }

        @media (min-width: 1024px) {
          [dir=rtl] .journey-card-left {
            left: auto !important;
            right: 0.5rem;
          }

          [dir=rtl] .journey-card-right {
            right: auto !important;
            left: 0.5rem;
          }
        }

        @media (min-width: 1280px) {
          [dir=rtl] .journey-card-left {
            right: 1.5rem;
          }

          [dir=rtl] .journey-card-right {
            left: 1.5rem;
          }
        }

        @media (max-width: 1023px) {
          .journey-showcase-group {
            animation: none;
          }

          .journey-float-left,
          .journey-float-center,
          .journey-float-right {
            animation: none;
          }

          .journey-steps-scroll {
            max-height: none;
            overflow: visible;
          }

          .journey-float-card,
          .journey-float-card-main {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
