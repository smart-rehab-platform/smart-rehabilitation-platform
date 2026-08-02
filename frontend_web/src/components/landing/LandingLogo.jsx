import smartRehabIcon from "../../assets/branding/smart_rehab_icon.png";
import { BrandIcon } from "../auth/Logo";
import { L } from "./landingTokens";

export function LandingLogo({ size = 40, showTagline = true, useAuthBrandIcon = false }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {useAuthBrandIcon ? (
        <BrandIcon size={size} color="#56B6E9" />
      ) : (
        <img
          src={smartRehabIcon}
          alt=""
          aria-hidden
          draggable={false}
          className="shrink-0 select-none"
          style={{
            height: size,
            width: "auto",
            maxHeight: size,
            objectFit: "contain",
          }}
        />
      )}      <div>
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
