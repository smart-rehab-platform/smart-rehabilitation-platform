import smartRehabHorizontalLogo from "../../assets/branding/smart_rehab_horizontal_logo.png";
import smartRehabHorizontalLogoHero from "../../assets/branding/smart_rehab_horizontal_logo2222.png";
import smartRehabIcon from "../../assets/branding/smart_rehab_icon.png";
import { C } from "./tokens";

const BRAND_LOGOS = {
  standard: smartRehabHorizontalLogo,
  hero: smartRehabHorizontalLogoHero,
};

function BrandLogoImage({
  maxHeight,
  alt = "Smart Rehabilitation",
  decorative = false,
  brandAsset = "hero",
}) {
  return (
    <img
      src={BRAND_LOGOS[brandAsset] ?? BRAND_LOGOS.hero}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      draggable={false}
      className="select-none"
      style={{
        objectFit: "contain",
        width: "auto",
        height: "auto",
        maxHeight,
      }}
    />
  );
}

export function BrandIcon({ size = 44, color = C.primary }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${smartRehabIcon})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: `url(${smartRehabIcon})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        filter: "drop-shadow(0 1px 2px rgba(15, 35, 66, 0.12))",
      }}
    />
  );
}

function BrandIconMark({ size, color = C.primary }) {
  return <BrandIcon size={size} color={color} />;
}

export function Logo({
  maxHeight = 36,
  iconSize = 34,
  size = 32,
  centered = false,
  showWordmark = false,
  titleOnly = false,
  brandAsset = "hero",
}) {
  const titleSize = Math.round(size * 0.36);
  const taglineSize = Math.round(size * 0.21);

  if (showWordmark) {
    return (
      <div className="flex items-center gap-3">
        <BrandIconMark size={iconSize} />
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
      </div>
    );
  }

  return (
    <div className={`flex shrink-0 ${centered ? "w-full justify-center" : "items-center"}`}>
      <BrandLogoImage maxHeight={maxHeight} brandAsset={brandAsset} />
    </div>
  );
}
