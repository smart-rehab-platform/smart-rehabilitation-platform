import { Brain, Stethoscope, TrendingUp, Users } from "lucide-react";
import { L } from "./landingTokens";

const VALUE_ITEMS = [
  {
    icon: Users,
    title: "Built for Families",
    subtitle: "Supportive, clear, and accessible",
  },
  {
    icon: Stethoscope,
    title: "Designed for Specialists",
    subtitle: "Clinical tools, full case visibility",
  },
  {
    icon: Brain,
    title: "Powered by AI",
    subtitle: "Smart summaries & recommendations",
  },
  {
    icon: TrendingUp,
    title: "Focused on Progress",
    subtitle: "Continuous, measurable improvement",
  },
];

function dividerClasses(index) {
  const isLast = index === VALUE_ITEMS.length - 1;
  const isLeftColumnTablet = index === 0 || index === 2;
  const isTopRowTablet = index < 2;

  return [
    !isLast ? "border-b" : "border-b-0",
    isTopRowTablet ? "sm:border-b" : "sm:border-b-0",
    isLeftColumnTablet ? "sm:border-r" : "sm:border-r-0",
    "lg:border-b-0",
    index < 3 ? "lg:border-r" : "lg:border-r-0",
  ].join(" ");
}

function cornerClasses(index) {
  switch (index) {
    case 0:
      return "rounded-t-2xl sm:rounded-tl-2xl sm:rounded-tr-none lg:rounded-l-2xl lg:rounded-tr-none lg:rounded-br-none";
    case 1:
      return "sm:rounded-tr-2xl lg:rounded-none";
    case 2:
      return "sm:rounded-bl-2xl lg:rounded-none";
    case 3:
      return "rounded-b-2xl sm:rounded-br-2xl sm:rounded-bl-none lg:rounded-r-2xl lg:rounded-tl-none lg:rounded-bl-none";
    default:
      return "";
  }
}

function ValueItem({ icon: Icon, title, subtitle, index }) {
  return (
    <div
      role="presentation"
      className={`value-strip-item flex h-full min-h-full w-full flex-col items-center text-center px-5 py-6 md:px-6 md:py-8 ${dividerClasses(index)} ${cornerClasses(index)}`}
      style={{ borderColor: L.lightDivider }}
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: L.lightIconBg }}
      >
        <Icon size={22} strokeWidth={1.75} style={{ color: L.primary }} aria-hidden="true" />
      </div>
      <h3
        className="mb-1.5 text-[15px] font-semibold leading-snug"
        style={{ color: L.lightText, fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="max-w-[220px] text-[13px] leading-relaxed"
        style={{ color: L.lightTextMuted, fontFamily: "'Inter', sans-serif" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export function ValueStrip() {
  return (
    <section
      className="relative w-full overflow-hidden px-5 pb-10 md:pb-12 lg:px-8"
      style={{ background: L.lightBg }}
      aria-label="Platform values"
    >
      <div
        className="value-strip-grid mx-auto grid max-w-[1100px] grid-cols-1 overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4"
        style={{
          background: L.lightBg,
          borderColor: L.lightBorder,
          boxShadow: L.lightShadow,
        }}
      >
        {VALUE_ITEMS.map((item, index) => (
          <ValueItem key={item.title} {...item} index={index} />
        ))}
      </div>

      <style>{`
        .value-strip-grid {
          grid-auto-rows: 1fr;
        }

        .value-strip-item {
          background-color: #FFFFFF;
          transition: background-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
        }

        @media (hover: hover) {
          .value-strip-item:hover {
            background-color: #EAF5FC;
            box-shadow: inset 0 0 0 1px rgba(79, 166, 248, 0.08);
          }
        }

        @media (hover: hover) and (prefers-reduced-motion: no-preference) {
          .value-strip-item:hover {
            transform: translateY(-1px);
          }
        }
      `}</style>
    </section>
  );
}
