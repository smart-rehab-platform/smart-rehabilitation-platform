import { useEffect, useRef, useState } from "react";
import { Check, FileText, TrendingUp } from "lucide-react";
import analyticsIcon from "../../assets/icons/analytics.svg";
import autoAwesomeMotionIcon from "../../assets/icons/auto_awesome_motion.svg";
import descriptionIcon from "../../assets/icons/description.svg";
import neurologyIcon from "../../assets/icons/neurology.svg";
import { useLocale } from "../../context/useLocale.js";
import { L } from "./landingTokens";

const AI_SECTION_BG = "#0F213D";
const AI_CARD_BG = "#162B4D";
const AI_CARD_BORDER = "rgba(255, 255, 255, 0.08)";
const AI_CARD_SHADOW = "0 12px 40px rgba(0, 0, 0, 0.18)";
const AI_CARD_SHADOW_HOVER = "0 20px 56px rgba(0, 0, 0, 0.28)";

const CARD_ANIMATIONS = [
  { hidden: "ai-card-hidden-left", visible: "ai-card-visible" },
  { hidden: "ai-card-hidden-right", visible: "ai-card-visible" },
  { hidden: "ai-card-hidden-bottom", visible: "ai-card-visible" },
  { hidden: "ai-card-hidden-bottom", visible: "ai-card-visible" },
];

function useInViewOnce(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AiMaterialIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="h-7 w-7 object-contain"
    />
  );
}

function AiCardShell({ accent, iconSrc, title, description, index, visible, children }) {
  return (
    <article
      className={`ai-feature-card flex h-full flex-col rounded-3xl border p-6 md:p-7 ${visible ? CARD_ANIMATIONS[index].visible : CARD_ANIMATIONS[index].hidden}`}
      style={{
        background: AI_CARD_BG,
        borderColor: AI_CARD_BORDER,
        boxShadow: AI_CARD_SHADOW,
        transitionDelay: visible ? `${index * 120}ms` : "0ms",
      }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: `${accent}22`,
          border: `1px solid ${accent}44`,
          boxShadow: `inset 0 0 12px ${accent}18`,
        }}
      >
        <AiMaterialIcon src={iconSrc} />
      </div>

      <h3
        className="mb-2 text-[18px] font-semibold leading-snug"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </h3>

      <p
        className="mb-5 text-[14px] leading-relaxed"
        style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
      >
        {description}
      </p>

      <div className="mt-auto">{children}</div>
    </article>
  );
}

function SpeechScoreWidget({ accent, t }) {
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = 94;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="rounded-2xl border p-5 text-center"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: AI_CARD_BORDER }}
    >
      <div className="relative mx-auto mb-3 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}>
            {value}%
          </span>
          <span className="text-[11px]" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
            {t("landing.ai.cards.speechAnalysis.widget.speechScore")}
          </span>
        </div>
      </div>
      <div
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
        style={{ background: `${accent}18`, color: accent, fontFamily: "'Inter', sans-serif" }}
      >
        <TrendingUp size={14} />
        {t("landing.ai.cards.speechAnalysis.widget.trend")}
      </div>
      <p className="mt-2 text-[11px]" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
        {t("landing.ai.cards.speechAnalysis.widget.comparedToPrevious")}
      </p>
    </div>
  );
}

function ClinicalSummaryWidget({ accent, t }) {
  const items = [
    t("landing.ai.cards.clinicalSummary.widget.goalCompletion"),
    t("landing.ai.cards.clinicalSummary.widget.speechClarity"),
    t("landing.ai.cards.clinicalSummary.widget.fluencyImproved"),
  ];

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: AI_CARD_BORDER }}
    >
      <p
        className="mb-3 text-[12px] font-semibold uppercase tracking-wide"
        style={{ color: accent, fontFamily: "'Inter', sans-serif" }}
      >
        {t("landing.ai.cards.clinicalSummary.widget.title")}
      </p>
      <ul className="mb-3 space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[13px]"
            style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
          >
            <Check size={14} style={{ color: accent }} strokeWidth={2.5} />
            {item}
          </li>
        ))}
      </ul>
      <p className="text-[11px]" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
        {t("landing.ai.cards.clinicalSummary.widget.generatedToday")}
      </p>
    </div>
  );
}

function RecommendationsWidget({ accent, t }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: AI_CARD_BORDER }}
    >
      <p
        className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: accent, fontFamily: "'Inter', sans-serif" }}
      >
        {t("landing.ai.cards.recommendations.widget.suggestedExercise")}
      </p>
      <p className="mb-4 text-[13px] leading-relaxed" style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}>
        {t("landing.ai.cards.recommendations.widget.increaseWarmUp")}
        <br />
        {t("landing.ai.cards.recommendations.widget.durationChange")}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border px-3 py-2 text-[12px] font-semibold"
          style={{
            borderColor: "rgba(56, 211, 159, 0.55)",
            color: "#38D39F",
            background: "rgba(56, 211, 159, 0.08)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {t("landing.ai.cards.recommendations.widget.approve")}
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border px-3 py-2 text-[12px] font-semibold"
          style={{
            borderColor: "rgba(239, 68, 68, 0.55)",
            color: "#F87171",
            background: "rgba(239, 68, 68, 0.08)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {t("landing.ai.cards.recommendations.widget.reject")}
        </button>
      </div>
    </div>
  );
}

function ReportGeneratorWidget({ accent, t }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: AI_CARD_BORDER }}
    >
      <div className="mb-3 flex items-center gap-2">
        <FileText size={16} style={{ color: accent }} />
        <span className="text-[13px] font-semibold" style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}>
          {t("landing.ai.cards.reportGenerator.widget.filename")}
        </span>
      </div>
      <p className="mb-2 text-[11px]" style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}>
        {t("landing.ai.cards.reportGenerator.widget.progress")}
      </p>
      <div className="mb-1 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: "82%", background: accent }} />
      </div>
      <p className="mb-4 text-end text-[11px] font-medium" style={{ color: accent, fontFamily: "'Inter', sans-serif" }}>
        82%
      </p>
      <button
        type="button"
        className="rounded-lg border px-3 py-2 text-[12px] font-semibold"
        style={{
          borderColor: `${accent}55`,
          color: accent,
          background: `${accent}14`,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {t("landing.ai.cards.reportGenerator.widget.exportPdf")}
      </button>
    </div>
  );
}

export function ArtificialIntelligenceSection() {
  const { t } = useLocale();
  const { ref, visible } = useInViewOnce(0.12);

  return (
    <section
      id="ai-solutions"
      ref={ref}
      className="overflow-hidden px-5 py-[120px] lg:px-8"
      style={{ background: AI_SECTION_BG }}
      aria-labelledby="ai-section-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <header className="mx-auto mb-14 max-w-[900px] text-center md:mb-16">
          <p
            className="mb-4 text-[13px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: L.primary, fontFamily: "'Inter', sans-serif" }}
          >
            {t("landing.ai.eyebrow")}
          </p>
          <h2
            id="ai-section-heading"
            className="text-[2.125rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
            style={{ color: L.text, fontFamily: "'Playfair Display', serif" }}
          >
            {t("landing.ai.heading.line1")}
            <br />
            <span
              style={{
                background: L.gradientHighlight,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("landing.ai.heading.highlight")}
            </span>
            <br />
            {t("landing.ai.heading.line2")}
          </h2>
          <p
            className="mx-auto mt-6 max-w-[720px] text-[16px] leading-relaxed md:text-[17px]"
            style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
          >
            {t("landing.ai.description")}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-8">
          <AiCardShell
            accent="#2AA4C9"
            iconSrc={neurologyIcon}
            title={t("landing.ai.cards.speechAnalysis.title")}
            description={t("landing.ai.cards.speechAnalysis.description")}
            index={0}
            visible={visible}
          >
            <SpeechScoreWidget accent="#2AA4C9" t={t} />
          </AiCardShell>

          <AiCardShell
            accent="#7C6CF7"
            iconSrc={descriptionIcon}
            title={t("landing.ai.cards.clinicalSummary.title")}
            description={t("landing.ai.cards.clinicalSummary.description")}
            index={1}
            visible={visible}
          >
            <ClinicalSummaryWidget accent="#7C6CF7" t={t} />
          </AiCardShell>

          <AiCardShell
            accent="#F5C84B"
            iconSrc={autoAwesomeMotionIcon}
            title={t("landing.ai.cards.recommendations.title")}
            description={t("landing.ai.cards.recommendations.description")}
            index={2}
            visible={visible}
          >
            <RecommendationsWidget accent="#F5C84B" t={t} />
          </AiCardShell>

          <AiCardShell
            accent="#38D39F"
            iconSrc={analyticsIcon}
            title={t("landing.ai.cards.reportGenerator.title")}
            description={t("landing.ai.cards.reportGenerator.description")}
            index={3}
            visible={visible}
          >
            <ReportGeneratorWidget accent="#38D39F" t={t} />
          </AiCardShell>
        </div>
      </div>

      <style>{`
        .ai-feature-card {
          transition:
            transform 250ms ease,
            box-shadow 250ms ease,
            opacity 600ms ease,
            translate 600ms ease;
        }

        @media (hover: hover) {
          .ai-feature-card:hover {
            transform: translateY(-8px);
            box-shadow: ${AI_CARD_SHADOW_HOVER};
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ai-feature-card {
            transition: box-shadow 250ms ease;
          }

          .ai-feature-card:hover {
            transform: none;
          }

          .ai-card-hidden-left,
          .ai-card-hidden-right,
          .ai-card-hidden-bottom {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        .ai-card-hidden-left {
          opacity: 0;
          transform: translateX(-48px);
        }

        .ai-card-hidden-right {
          opacity: 0;
          transform: translateX(48px);
        }

        .ai-card-hidden-bottom {
          opacity: 0;
          transform: translateY(48px);
        }

        [dir=rtl] .ai-card-hidden-left {
          transform: translateX(48px);
        }

        [dir=rtl] .ai-card-hidden-right {
          transform: translateX(-48px);
        }

        .ai-card-visible {
          opacity: 1;
          transform: translate(0, 0);
        }
      `}</style>
    </section>
  );
}
