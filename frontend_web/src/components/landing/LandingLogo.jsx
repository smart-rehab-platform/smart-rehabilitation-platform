import { BRAND_ASSETS } from "../../styles/brandTokens";
import { L } from "./landingTokens";

export function LandingLogo({ size = 36, showTagline = true }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <img
        src={BRAND_ASSETS.icon}
        alt=""
        width={size}
        height={size}
        aria-hidden="true"
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
      <div>
        <p
          className="text-[15px] font-semibold leading-tight"
          style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
        >
          Smart Rehabilitation
        </p>
        {showTagline && (
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: L.textLight }}>
            Where Recovery Never Stops
          </p>
        )}
      </div>
    </div>
  );
}
