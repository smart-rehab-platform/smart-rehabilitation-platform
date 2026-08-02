import {
  Activity,
  Bell,
  Calendar,
  Check,
  MessageSquare,
  Mic,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { L } from "./landingTokens";

const PROGRESS_PERCENT = 67;
const CURRENT_STEP_INDEX = 4;

const WORKFLOW_STEPS = [
  {
    title: "Submit Case Request",
    description:
      "Parent submits child information, category, case description and attachments.",
  },
  {
    title: "Specialist Assignment",
    description: "Administrator reviews the request and assigns the appropriate specialist.",
  },
  {
    title: "Assessment & Communication",
    description: "Specialist communicates with family and performs assessment.",
  },
  {
    title: "Accept & Create Patient",
    description: "Accepted case becomes an active patient profile.",
  },
  {
    title: "Treatment Plan",
    description: "Specialist creates treatment plan and goals.",
  },
  {
    title: "Home Exercises",
    description:
      "Parent completes assigned exercises and uploads videos, audio and notes.",
  },
  {
    title: "Specialist Review",
    description:
      "Specialist reviews submissions, provides feedback, and requests retry if necessary.",
  },
  {
    title: "AI Progress Tracking",
    description:
      "AI generates speech analysis, progress reports, weekly summaries and recommendations.",
  },
];

const AI_WIDGETS = [
  { icon: Mic, label: "Speech Analysis" },
  { icon: Activity, label: "Weekly Summary" },
  { icon: TrendingUp, label: "Progress Score" },
  { icon: Sparkles, label: "AI Recommendation" },
];

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

function PatientJourneyCard() {
  return (
    <article
      aria-label="Complete patient rehabilitation journey"
      className="journey-float-card journey-float-card-main w-full max-w-[460px] rounded-2xl p-5 transition-all duration-300 md:p-6"
      style={cardStyle}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h3
          className="text-[17px] font-semibold"
          style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
        >
          Patient Journey
        </h3>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{
            background: L.badgeBg,
            color: L.badgeText,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Active Rehabilitation
        </span>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>Progress</span>
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

      <ol className="journey-steps-scroll flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1 md:max-h-[460px]">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCurrent = index === CURRENT_STEP_INDEX;
          const isComplete = index < CURRENT_STEP_INDEX;
          const isPending = index > CURRENT_STEP_INDEX;

          return (
            <li
              key={step.title}
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

function AiProgressPreview() {
  return (
    <article
      aria-label="AI progress report preview"
      className="journey-float-card w-[220px] rounded-2xl p-4 transition-all duration-300 md:w-[240px]"
      style={{ ...cardStyle, opacity: 0.96 }}
    >
      <h3
        className="mb-3 text-[13px] font-semibold"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        AI Progress Report
      </h3>
      <div className="mb-3 flex justify-center">
        <CircularProgress value={92} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {AI_WIDGETS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-lg px-2 py-1.5"
            style={{ background: L.accentMuted, border: `1px solid ${L.journeyCardBorder}` }}
          >
            <Icon size={12} style={{ color: L.primarySecondary }} aria-hidden="true" />
            <p
              className="mt-0.5 text-[9px] leading-tight"
              style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ParentDashboardPreview() {
  return (
    <article
      aria-label="Parent dashboard preview"
      className="journey-float-card w-[220px] rounded-2xl p-4 transition-all duration-300 md:w-[240px]"
      style={{ ...cardStyle, opacity: 0.96 }}
    >
      <h3
        className="mb-3 text-[13px] font-semibold"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        Parent Dashboard
      </h3>

      <div
        className="mb-3 rounded-lg p-2.5"
        style={{ background: L.accentMuted, border: `1px solid ${L.journeyCardBorder}` }}
      >
        <p className="text-[10px] font-medium" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
          Today&apos;s Exercises
        </p>
        <p className="mt-0.5 text-[12px] font-semibold" style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}>
          2 Completed · 1 Remaining
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full" style={{ background: "rgba(42, 164, 201, 0.12)" }}>
          <div className="h-full w-2/3 rounded-full" style={{ background: L.primary }} />
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {[
          { icon: Calendar, label: "Next Session", detail: "Tomorrow · 10:00 AM" },
          { icon: MessageSquare, label: "Specialist Feedback", detail: "New feedback available." },
          { icon: Bell, label: "AI Reminder", detail: "Evening exercise due." },
        ].map(({ icon: Icon, label, detail }) => (
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
          THE JOURNEY
        </p>
        <h2
          id="journey-heading"
          className="text-[2.125rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
          style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
        >
          From First Request to Continuous Progress
        </h2>
        <p
          className="mx-auto mt-5 max-w-[720px] text-[16px] leading-relaxed md:mt-6 md:text-[17px] lg:text-[18px]"
          style={{ color: L.journeyBody, fontFamily: "'Inter', sans-serif" }}
        >
          Follow the complete rehabilitation journey—from the parent&apos;s first case request to continuous
          AI-powered rehabilitation support and measurable patient improvement.
        </p>
      </header>

      <div className="journey-showcase-group mx-auto max-w-6xl">
        <div className="journey-showcase-inner relative mx-auto min-h-[680px] max-w-[980px] md:min-h-[620px]">
          <div className="journey-card-left absolute left-0 top-0 z-10 md:left-2 md:top-2 lg:left-6">
            <FloatWrap floatClass="journey-float journey-float-left">
              <AiProgressPreview />
            </FloatWrap>
          </div>

          <div className="journey-card-center absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <FloatWrap floatClass="journey-float journey-float-center">
              <PatientJourneyCard />
            </FloatWrap>
          </div>

          <div className="journey-card-right absolute bottom-0 right-0 z-20 md:bottom-4 md:right-2 lg:right-6">
            <FloatWrap floatClass="journey-float journey-float-right">
              <ParentDashboardPreview />
            </FloatWrap>
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

        .journey-float-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .journey-float-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: ${L.journeyFloatShadowHover};
        }

        .journey-float-card-main:hover {
          transform: translateY(-8px) scale(1.02);
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

        @media (max-width: 767px) {
          .journey-showcase-group {
            animation: none;
          }

          .journey-showcase-inner {
            min-height: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.25rem;
            padding-bottom: 1rem;
          }

          .journey-card-left,
          .journey-card-center,
          .journey-card-right {
            position: relative;
            left: auto;
            right: auto;
            top: auto;
            bottom: auto;
            transform: none;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .journey-card-center {
            order: -1;
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
        }
      `}</style>
    </section>
  );
}
