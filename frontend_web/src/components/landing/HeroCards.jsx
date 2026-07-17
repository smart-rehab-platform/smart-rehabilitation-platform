import { ArrowRight, Check, Heart, Shield, Users } from "lucide-react";
import { L } from "./landingTokens";

const ROLE_CARDS = [
  {
    key: "family",
    sectionId: "for-families",
    eyebrow: "For Families",
    icon: Heart,
    iconBg: L.accentSoft,
    title: "Everything Parents Need in One Place",
    description:
      "Track exercises, daily tasks, sessions, AI reports, notifications and communicate directly with specialists.",
    badges: ["Exercise Tracking", "AI Reports", "Parent Dashboard", "Secure Communication"],
    cta: "Explore Parent Features",
  },
  {
    key: "specialist",
    sectionId: "for-specialists",
    eyebrow: "For Specialists",
    icon: Users,
    iconBg: L.accentMuted,
    title: "Complete Rehabilitation Management",
    description:
      "Manage patients, assessments, treatment plans, exercises, reviews, reports and AI-powered rehabilitation tools.",
    badges: ["Patient Management", "Treatment Plans", "Speech Analysis", "AI Recommendations"],
    cta: "Explore Specialist Features",
  },
  {
    key: "admin",
    sectionId: "for-administrators",
    eyebrow: "For Administrators",
    icon: Shield,
    iconBg: L.accentSoft,
    title: "Complete Platform Oversight",
    description:
      "Manage users, specialists, patients, case requests, assignments, categories, and system-wide activity from one centralized workspace.",
    badges: ["User Management", "Case Requests", "Specialist Assignments", "System Analytics"],
    cta: "Explore Admin Features",
    centeredOnTablet: true,
  },
];

function CardBadge({ children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
      style={{
        background: L.badgeBg,
        color: L.badgeText,
        borderColor: L.accentBorder,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Check size={12} strokeWidth={2.5} />
      {children}
    </span>
  );
}

function HeroCard({ sectionId, eyebrow, icon: Icon, iconBg, title, description, badges, cta, className = "" }) {
  return (
    <article
      id={sectionId}
      className={`group flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-0.5 md:p-8 ${className}`}
      style={{
        background: L.bgCard,
        borderColor: L.border,
        boxShadow: L.cardShadow,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.boxShadow = L.cardShadowHover;
        event.currentTarget.style.borderColor = L.primary;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.boxShadow = L.cardShadow;
        event.currentTarget.style.borderColor = L.border;
      }}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg border"
          style={{ background: iconBg, borderColor: L.accentBorder }}
        >
          <Icon size={18} style={{ color: L.primary }} strokeWidth={2} />
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}
        >
          {eyebrow}
        </span>
      </div>

      <h3
        className="mb-3 text-[17px] font-semibold leading-snug"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </h3>

      <p
        className="mb-6 flex-1 text-[14px] leading-relaxed"
        style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
      >
        {description}
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <CardBadge key={badge}>{badge}</CardBadge>
        ))}
      </div>

      <a
        href={`#${sectionId}`}
        className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-all duration-200 group-hover:gap-2.5"
        style={{ color: L.primaryLight, fontFamily: "'Inter', sans-serif" }}
      >
        {cta}
        <ArrowRight size={16} />
      </a>
    </article>
  );
}

export function HeroCards() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12 lg:mb-14">
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] md:mb-4"
          style={{ color: L.primary, fontFamily: "'Inter', sans-serif" }}
        >
          WHO IT&apos;S FOR
        </p>
        <h2
          className="text-[2.125rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
          style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
        >
          One Platform. Three Connected Experiences.
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {ROLE_CARDS.map((card) => (
          <HeroCard
            key={card.key}
            sectionId={card.sectionId}
            eyebrow={card.eyebrow}
            icon={card.icon}
            iconBg={card.iconBg}
            title={card.title}
            description={card.description}
            badges={card.badges}
            cta={card.cta}
            className={
              card.centeredOnTablet
                ? "md:col-span-2 md:mx-auto md:max-w-[calc(50%-12px)] lg:col-span-1 lg:mx-0 lg:max-w-none"
                : ""
            }
          />
        ))}
      </div>
    </div>
  );
}
