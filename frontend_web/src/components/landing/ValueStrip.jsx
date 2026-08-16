import { useMemo } from "react";
import { Brain, Stethoscope, TrendingUp, Users } from "lucide-react";
import { useLocale } from "../../context/useLocale.js";
import { buildLandingValueItems } from "./landingLocalization.js";
import { L } from "./landingTokens";

const VALUE_ICON_MAP = {
  users: Users,
  stethoscope: Stethoscope,
  brain: Brain,
  trendingUp: TrendingUp,
};

function dividerClasses(index, itemCount) {
  const isLast = index === itemCount - 1;
  const isLeftColumnTablet = index === 0 || index === 2;
  const isTopRowTablet = index < 2;

  return [
    !isLast ? "border-b" : "border-b-0",
    isTopRowTablet ? "sm:border-b" : "sm:border-b-0",
    isLeftColumnTablet ? "sm:border-e" : "sm:border-e-0",
    "lg:border-b-0",
    index < 3 ? "lg:border-e" : "lg:border-e-0",
  ].join(" ");
}

function cornerClasses(index) {
  switch (index) {
    case 0:
      return "rounded-t-2xl sm:rounded-ts-2xl sm:rounded-te-none lg:rounded-s-2xl lg:rounded-te-none lg:rounded-be-none";
    case 1:
      return "sm:rounded-te-2xl lg:rounded-none";
    case 2:
      return "sm:rounded-bs-2xl lg:rounded-none";
    case 3:
      return "rounded-b-2xl sm:rounded-be-2xl sm:rounded-bs-none lg:rounded-e-2xl lg:rounded-ts-none lg:rounded-bs-none";
    default:
      return "";
  }
}

function ValueItem({ icon: Icon, title, subtitle, index, itemCount }) {
  return (
    <div
      role="presentation"
      className={`value-strip-item flex h-full min-h-full w-full flex-col items-center text-center px-5 py-6 md:px-6 md:py-8 ${dividerClasses(index, itemCount)} ${cornerClasses(index)}`}
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
  const { t } = useLocale();
  const valueItems = useMemo(() => buildLandingValueItems(t), [t]);

  const itemsWithIcons = useMemo(
    () =>
      valueItems.map((item) => ({
        ...item,
        icon: VALUE_ICON_MAP[item.icon],
      })),
    [valueItems],
  );

  return (
    <section
      className="relative w-full overflow-hidden px-5 pb-10 md:pb-12 lg:px-8"
      style={{ background: L.lightBg }}
      aria-label={t("landing.valueStrip.ariaLabel")}
    >
      <div
        className="value-strip-grid mx-auto grid max-w-[1100px] grid-cols-1 overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4"
        style={{
          background: L.lightBg,
          borderColor: L.lightBorder,
          boxShadow: L.lightShadow,
        }}
      >
        {itemsWithIcons.map((item, index) => (
          <ValueItem key={item.key} {...item} index={index} itemCount={itemsWithIcons.length} />
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
            box-shadow: inset 0 0 0 1px rgba(42, 164, 201, 0.08);
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
