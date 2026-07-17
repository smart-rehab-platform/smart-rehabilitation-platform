import { Sparkles, Users, TrendingUp } from "lucide-react";
import { L } from "./landingTokens";

const FEATURES = [
  { icon: Sparkles, label: "AI-Powered Insights" },
  { icon: Users, label: "3 Connected Roles" },
  { icon: TrendingUp, label: "Continuous Progress" },
];

export function FeatureIndicators() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
      {FEATURES.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-[13px] font-medium"
          style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
        >
          <Icon size={15} style={{ color: L.primary }} strokeWidth={2} />
          {label}
        </div>
      ))}
    </div>
  );
}
