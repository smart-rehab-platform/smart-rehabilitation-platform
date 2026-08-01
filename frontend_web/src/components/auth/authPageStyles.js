import { C } from "./tokens";

export const authPageHeadingClassName =
  "text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[36px]";

export const authPageHeadingStyle = {
  fontFamily: "'Syne', sans-serif",
  color: C.navy,
  fontWeight: 600,
};

export const authPageSubtitleClassName =
  "text-[15px] font-normal leading-[1.45] sm:text-[16px]";

export const authPageSubtitleStyle = {
  color: "#5A7390",
  fontFamily: "'Inter', sans-serif",
};

export function isInvalidResetTokenMessage(message) {
  if (typeof message !== "string") {
    return false;
  }

  return /invalid|expired/i.test(message);
}
