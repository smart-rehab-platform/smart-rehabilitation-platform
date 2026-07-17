import { L } from "./landingTokens";

export function WaveDivider() {
  return (
    <div
      className="relative w-full overflow-hidden leading-[0] -mt-10 sm:-mt-12 md:-mt-16"
      style={{ marginBottom: "-1px" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        className="block w-full h-[48px] sm:h-[56px] md:h-[72px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,36 C240,72 480,8 720,36 C960,64 1200,12 1440,36 L1440,72 L0,72 Z"
          fill={L.lightBg}
        />
      </svg>
    </div>
  );
}
