import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { FeatureIndicators } from "./FeatureIndicators";
import { L } from "./landingTokens";

function scrollToFeatures() {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden px-5 pt-12 pb-16 md:pt-16 md:pb-20 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${L.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${L.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute left-1/2 top-24 md:top-28 -translate-x-1/2 w-[min(720px,90vw)] h-[360px] md:h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(79,166,248,0.2) 0%, rgba(79,166,248,0.06) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium mb-8 md:mb-10 backdrop-blur-sm border"
          style={{
            background: L.accentSoft,
            color: L.primaryLight,
            borderColor: L.accentBorder,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Sparkles size={14} strokeWidth={2} style={{ color: L.primary }} />
          AI-Powered • Family-Centered • Specialist-Led
        </div>

        <h1
          className="text-[2.4rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.6rem] leading-[1.12] tracking-tight mb-6 md:mb-7"
          style={{ fontFamily: "'Playfair Display', serif", color: L.text }}
        >
          Smarter Rehabilitation.
          <br />
          Stronger{" "}
          <span
            style={{
              background: L.gradientHighlight,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Family Support.
          </span>
          <br />
          Better Progress.
        </h1>

        <p
          className="text-base md:text-[17px] leading-relaxed max-w-2xl mx-auto mb-9 md:mb-10 px-2"
          style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
        >
          One connected platform that brings families, specialists, and intelligent
          rehabilitation tools together to support every patient&apos;s rehabilitation journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all duration-200"
            style={{
              background: L.gradientButton,
              fontFamily: "'Inter', sans-serif",
              boxShadow: `0 4px 24px ${L.hoverGlow}`,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.boxShadow = `0 8px 32px ${L.hoverGlow}`;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.boxShadow = `0 4px 24px ${L.hoverGlow}`;
            }}
          >
            Get Started
            <ArrowRight size={17} />
          </Link>
          <button
            type="button"
            onClick={scrollToFeatures}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl text-[15px] font-semibold border transition-all duration-200 backdrop-blur-sm"
            style={{
              color: L.primaryLight,
              borderColor: L.border,
              background: "rgba(18, 40, 70, 0.4)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = L.primary;
              event.currentTarget.style.background = L.accentSoft;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = L.border;
              event.currentTarget.style.background = "rgba(18, 40, 70, 0.4)";
            }}
          >
            <Play size={16} fill={L.primary} strokeWidth={0} />
            Explore the Platform
          </button>
        </div>

        <FeatureIndicators />
      </div>

      <div id="about" className="sr-only" aria-hidden="true" />
    </section>
  );
}
