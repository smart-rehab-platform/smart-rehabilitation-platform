import { BRAND_ASSETS } from "../../styles/brandTokens";
import { C } from "./tokens";

export function Logo({ size = 40, showWordmark = true, centered = false, titleOnly = false }) {
  const titleSize = Math.round(size * 0.36);
  const taglineSize = Math.round(size * 0.21);

  if (showWordmark && !titleOnly) {
    return (
      <div className={`flex items-center ${centered ? "flex-col text-center" : ""}`}>
        <img
          src={BRAND_ASSETS.horizontalLogo}
          alt="Smart Rehabilitation"
          style={{ height: Math.max(size, 36), width: "auto", maxWidth: "100%" }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${centered ? "flex-col text-center" : ""}`}>
      <img
        src={BRAND_ASSETS.icon}
        alt="Smart Rehabilitation"
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <div>
          <p
            className="font-bold leading-none"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: titleSize, color: C.white }}
          >
            Smart Rehabilitation
          </p>
          {!titleOnly && (
            <p
              className="leading-snug mt-1.5"
              style={{ fontSize: taglineSize, color: C.light, letterSpacing: "0.02em" }}
            >
              Empowering rehabilitation through smart daily follow-up
            </p>
          )}
        </div>
      )}
    </div>
  );
}
