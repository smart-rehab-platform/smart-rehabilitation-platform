import { TrendingUp, Users } from "lucide-react";
import neurologyIcon from "../../assets/icons/neurology.svg";
import { L } from "./landingTokens";

const FEATURES = [
  { label: "AI-Powered Insights", iconSrc: neurologyIcon },
  { icon: Users, label: "3 Connected Roles" },
  { icon: TrendingUp, label: "Continuous Progress" },
];

function FeatureIndicatorIcon({ feature }) {
  if (feature.iconSrc) {
    return (
      <img
        src={feature.iconSrc}
        alt=""
        aria-hidden="true"
        className="h-[22px] w-[22px] shrink-0 object-contain"
      />
    );
  }

  const Icon = feature.icon;
  return <Icon size={15} style={{ color: L.primary }} strokeWidth={2} aria-hidden="true" />;
}

export function FeatureIndicators() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
      {FEATURES.map((feature) => (
        <div
          key={feature.label}
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
