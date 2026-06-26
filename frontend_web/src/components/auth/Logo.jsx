import { C } from "./tokens";

export function Logo({ size = 40, showWordmark = true, centered = false, titleOnly = false }) {
  const titleSize = Math.round(size * 0.36);
  const taglineSize = Math.round(size * 0.21);

  return (
    <div className={`flex items-center gap-3 ${centered ? "flex-col text-center" : ""}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4A7FA7" />
            <stop offset="100%" stopColor="#B3CFE5" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="20" r="19" fill="#1A3D63" stroke="url(#lg1)" strokeWidth="1.5" />
        <path
          d="M20 28 C20 28 11 22 11 16.5 C11 13.5 13.5 11 16.5 11 C18.2 11 19.5 12 20 13 C20.5 12 21.8 11 23.5 11 C26.5 11 29 13.5 29 16.5 C29 22 20 28 20 28Z"
          fill="url(#lg1)"
          opacity="0.3"
        />
        <path
          d="M11 18 L15 18 L17 14 L19 22 L21 16 L23 18 L29 18"
          stroke="#6FA9CF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        <circle cx="20" cy="30.5" r="1.2" fill="#6FA9CF" opacity="0.8" />
      </svg>
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
