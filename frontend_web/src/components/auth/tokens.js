import { BRAND, BRAND_RGB } from "../../styles/brandTokens";

export const C = {
  navy: BRAND.authPrimaryNavy,
  navySecondary: BRAND.authDarkBlue,
  card: BRAND.authCardBackground,
  primary: BRAND.authMediumBlue,
  medium: BRAND.authButtonHighlight,
  soft: BRAND.brandLightBlue,
  light: BRAND.authLightBlue,
  textLight: BRAND.authLightBlue,
  white: BRAND.white,
  inputBg: BRAND.authInputBackground,
  border: BRAND.authBorder,
  placeholder: BRAND.authPlaceholder,
  iconInteractive: BRAND.brandCyan,
  linkHover: BRAND.authButtonHighlight,
};

export const G = {
  heroHighlight: BRAND.gradientPrimary,
  button: BRAND.gradientPrimary,
  tabActive: BRAND.gradientPrimary,
  glow: `rgba(${BRAND_RGB.brandCyan}, 0.25)`,
  glowStrong: `rgba(${BRAND_RGB.brandCyan}, 0.35)`,
  glowSoft: `rgba(${BRAND_RGB.brandCyan}, 0.12)`,
  borderSoft: BRAND.authBorder,
  borderFocus: BRAND.brandCyan,
  focusRing: `0 0 0 4px rgba(${BRAND_RGB.brandCyan}, 0.15)`,
  success: BRAND.success,
  cardBg: BRAND.authCardBackground,
  cardShadow: "0 10px 30px rgba(7, 24, 44, 0.12)",
  hoverBg: `rgba(${BRAND_RGB.brandCyan}, 0.08)`,
  navyOverlay: `rgba(${BRAND_RGB.authPrimaryNavy}`,
  cardOverlay: "rgba(23, 59, 94",
};
