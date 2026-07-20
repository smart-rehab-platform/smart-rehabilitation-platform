import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import bgVideo from "../../assets/auth-bg.mp4";
import { Logo } from "./Logo";
import { C, G } from "./tokens";

const VIDEO_START_SECONDS = 4;
const VIDEO_SRC = `${bgVideo}#t=${VIDEO_START_SECONDS}`;

export function AuthLayout({ activeTab, onTabChange, children, scrollable = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.play().catch(() => {});
    };

    const syncStartTime = () => {
      if (!Number.isFinite(video.duration) || video.duration <= VIDEO_START_SECONDS) return;
      if (Math.abs(video.currentTime - VIDEO_START_SECONDS) > 0.25) {
        video.currentTime = VIDEO_START_SECONDS;
      }
    };

    const handleEnded = () => {
      syncStartTime();
      playVideo();
    };

    playVideo();

    video.addEventListener("loadedmetadata", syncStartTime);
    video.addEventListener("canplay", playVideo);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 1) {
      syncStartTime();
    }

    return () => {
      video.removeEventListener("loadedmetadata", syncStartTime);
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif", background: C.navy }}
    >
      {/* ── Full-page background video ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: "scaleX(-1)",
            filter: "brightness(0.86) saturate(0.88) contrast(1.04)",
          }}
          src={VIDEO_SRC}
          preload="auto"
          autoPlay
          muted
          playsInline
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              `linear-gradient(160deg, ${G.navyOverlay}, 0.44) 0%, ${G.cardOverlay}, 0.22) 42%, ${G.navyOverlay}, 0.50) 100%)`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${G.navyOverlay}, 0.30) 0%, ${G.navyOverlay}, 0.46) 38%, ${G.navyOverlay}, 0.68) 62%, ${G.navyOverlay}, 0.80) 100%)`,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 25% 50%, rgba(79, 166, 248, 0.1) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <header
        className="relative z-20 flex h-[72px] w-full shrink-0 items-center justify-between gap-3 px-5 sm:px-8 lg:px-10"
        style={{
          background: `${G.navyOverlay}, 0.72)`,
          borderBottom: "1px solid rgba(79, 166, 248, 0.18)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Logo size={30} titleOnly />
        <Link
          to="/"
          className="auth-back-home text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none sm:text-[14px]"
          style={{ color: "#B7C8DD" }}
        >
          <span className="sm:hidden">← Back</span>
          <span className="hidden sm:inline">← Back to Home</span>
        </Link>
      </header>

      {/* ── Content: hero + form ── */}
      <div className="relative z-10 flex w-full flex-1 flex-col">
        <div className="flex w-full flex-1 flex-col lg:flex-row">
        <div className="flex w-full items-center justify-center px-8 py-10 lg:w-[58%] lg:min-h-0 lg:px-14 lg:py-12 min-h-[40vh]">
          <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center lg:gap-10">
            <div className="relative flex flex-col gap-5">
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "-2.5rem",
                  bottom: "-2.5rem",
                  left: "-3rem",
                  right: "-3rem",
                  background:
                    `radial-gradient(ellipse 85% 75% at 50% 50%, ${G.navyOverlay}, 0.72) 0%, ${G.navyOverlay}, 0.4) 42%, transparent 72%)`,
                }}
                aria-hidden
              />
              <h1
                className="relative z-10 text-4xl sm:text-5xl xl:text-[3.25rem] font-extrabold"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  textShadow: "0 6px 24px rgba(0,0,0,0.55)",
                  lineHeight: 1.05,
                }}
              >
                <span className="block" style={{ color: C.white }}>
                  AI-Powered
                </span>
                <span
                  className="block"
                  style={{
                    background: G.heroHighlight,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    opacity: 1,
                    filter:
                      "drop-shadow(0 2px 10px rgba(79, 166, 248, 0.35)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.28))",
                  }}
                >
                  Rehabilitation
                </span>
                <span className="block" style={{ color: C.white, marginTop: -10 }}>
                  Support
                </span>
              </h1>
              <p
                className="relative z-10 mx-auto max-w-md text-base leading-relaxed sm:text-lg"
                style={{ color: C.light, opacity: 0.92 }}
              >
                Track progress, guide exercises, and connect families with specialists through smart daily follow-up.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[45vh] flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:min-h-0 lg:px-10">
          <div className="w-full max-w-[420px]">
            <div
              className="relative overflow-hidden rounded-3xl p-7"
              style={{
                background: G.cardBg,
                border: `1.5px solid ${C.border}`,
                backdropFilter: "blur(20px)",
                boxShadow: G.cardShadow,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${C.primary}, transparent)` }}
              />

              <div className="mb-6 flex rounded-xl p-1" style={{ background: `${G.navyOverlay}, 0.6)` }}>
                {["signin", "signup"].map((t) => (
                  <button
                    key={t}
                    onClick={() => onTabChange(t)}
                    className="flex-1 rounded-lg py-2.5 text-sm font-semibold"
                    style={
                      activeTab === t
                        ? {
                            background: G.tabActive,
                            color: C.white,
                            boxShadow: G.cardShadow,
                          }
                        : { color: C.light, opacity: 0.6 }
                    }
                  >
                    {t === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <div className={scrollable ? "scrollbar-thin max-h-[60vh] overflow-y-auto pr-1" : ""}>
                {children}
              </div>
            </div>
          </div>
        </div>
        </div>

        <p
          className="relative z-10 mt-auto shrink-0 px-5 pb-6 pt-2 text-center text-[13px] font-normal"
          style={{ color: "rgba(255, 255, 255, 0.55)" }}
        >
          © 2026 Smart Rehabilitation Platform
        </p>
      </div>

      <style>{`
        .auth-back-home:focus-visible {
          box-shadow: 0 0 0 3px rgba(79, 166, 248, 0.28);
          border-radius: 6px;
        }

        @media (hover: hover) {
          .auth-back-home:hover {
            color: #79C7FF !important;
            transform: translateX(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-back-home:hover {
            transform: none;
          }
        }

        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(79, 166, 248, 0.25); border-radius: 99px; }
        input::placeholder, .auth-input::placeholder { color: ${C.placeholder}; }
      `}</style>
    </div>
  );
}
