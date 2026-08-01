/**
 * Official Smart Rehabilitation logo mark — same SVG as LandingLogo.jsx / Navbar.
 */
export function LandingLogoMark({ size = 34, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="pd-sidebar-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4FA6F8" />
          <stop offset="100%" stopColor="#9BD7FF" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="#122846" stroke="url(#pd-sidebar-logo-gradient)" strokeWidth="1.5" />
      <path
        d="M20 28 C20 28 11 22 11 16.5 C11 13.5 13.5 11 16.5 11 C18.2 11 19.5 12 20 13 C20.5 12 21.8 11 23.5 11 C26.5 11 29 13.5 29 16.5 C29 22 20 28 20 28Z"
        fill="url(#pd-sidebar-logo-gradient)"
        opacity="0.3"
      />
      <path
        d="M11 18 L15 18 L17 14 L19 22 L21 16 L23 18 L29 18"
        stroke="#66C4FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="30.5" r="1.2" fill="#66C4FF" opacity="0.8" />
    </svg>
  );
}
