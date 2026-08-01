import { getPlatformIconSrc, PLATFORM_ICON_FALLBACK_KEY } from "./platformIconAssets";

export function PlatformMaterialIcon({
  icon,
  size = 18,
  className = "",
}) {
  const src = typeof icon === "string" ? getPlatformIconSrc(icon) : icon;
  const resolvedSrc = src || getPlatformIconSrc(PLATFORM_ICON_FALLBACK_KEY);

  if (!resolvedSrc) {
    return null;
  }

  return (
    <img
      src={resolvedSrc}
      alt=""
      aria-hidden="true"
      className={`pd-platform-icon${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
    />
  );
}
