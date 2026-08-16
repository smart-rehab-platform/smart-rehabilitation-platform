import { useMemo } from "react";
import { TrendingUp, Users } from "lucide-react";
import neurologyIcon from "../../assets/icons/neurology.svg";
import { useLocale } from "../../context/useLocale.js";
import { buildLandingFeatureIndicators } from "./landingLocalization.js";
import { L } from "./landingTokens";

const FEATURE_ICON_MAP = {
  users: Users,
  trendingUp: TrendingUp,
};

function FeatureIndicatorIcon({ feature }) {
  if (feature.iconSrc) {
    return (
      <img
        src={neurologyIcon}
        alt=""
        aria-hidden="true"
        className="h-[22px] w-[22px] shrink-0 object-contain"
      />
    );
  }

  const Icon = FEATURE_ICON_MAP[feature.icon];
  if (!Icon) return null;

  return <Icon size={15} style={{ color: L.primary }} strokeWidth={2} aria-hidden="true" />;
}

export function FeatureIndicators() {
  const { t } = useLocale();
  const features = useMemo(() => buildLandingFeatureIndicators(t), [t]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
      {features.map((feature) => (
        <div
          key={feature.key}
          className="flex items-center gap-2 text-[13px] font-medium"
          style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
        >
          <FeatureIndicatorIcon feature={feature} />
          {feature.label}
        </div>
      ))}
    </div>
  );
}
