import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import verifiedUserIcon from "../../assets/icons/verified_user.svg";
import { useLocale } from "../../context/useLocale.js";
import { FeatureIndicators } from "./FeatureIndicators";
import { L } from "./landingTokens";

function scrollToFeatures() {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const { t } = useLocale();

  return (
    <section id="home" className="relative overflow-hidden px-5 pt-12 pb-16 md:pt-16 md:pb-20 lg:px-8">
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
          <img
            src={verifiedUserIcon}
            alt=""
            aria-hidden="true"
            className="h-[18px] w-[18px] shrink-0 object-contain"
          />
          {t("landing.hero.badge")}
        </div>

        <h1
          className="text-[2.4rem] sm:text-5xl md:text-[3.25rem] lg:text-[3.6rem] leading-[1.12] tracking-tight mb-6 md:mb-7"
          style={{ fontFamily: "'Playfair Display', serif", color: L.text }}
        >
          {t("landing.hero.headline.line1")}
          <br />
          {t("landing.hero.headline.line2Prefix")}{" "}
          <span
            style={{
              background: L.gradientHighlight,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("landing.hero.headline.line2Highlight")}
          </span>
          <br />
          {t("landing.hero.headline.line3")}
        </h1>

        <p
          className="text-base md:text-[17px] leading-relaxed max-w-2xl mx-auto mb-9 md:mb-10 px-2"
          style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
        >
          {t("landing.hero.description")}
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
            {t("landing.hero.getStarted")}
            <ArrowRight size={17} className="rtl:rotate-180" />
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
            {t("landing.hero.explorePlatform")}
          </button>
        </div>

        <FeatureIndicators />
      </div>
    </section>
  );
}
