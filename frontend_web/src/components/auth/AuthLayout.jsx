import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import bgVideo from "../../assets/auth-bg.mp4";
import { Logo } from "./Logo";
import { C, G } from "./tokens";

const transition = { duration: 0.75, ease: [0.4, 0, 0.2, 1] };
const VIDEO_START_SECONDS = 4;
const AUTH_BOX_DELAY_MS = 1500;

export function AuthLayout({ activeTab, onTabChange, children, scrollable = false }) {
  const [showAuthBox, setShowAuthBox] = useState(false);
  const videoRef = useRef(null);
  const authTimerStarted = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let authTimer;

    const startAuthReveal = () => {
      if (authTimerStarted.current) return;
      authTimerStarted.current = true;
      authTimer = setTimeout(() => setShowAuthBox(true), AUTH_BOX_DELAY_MS);
    };

    const seekToStart = () => {
      if (video.duration > VIDEO_START_SECONDS) {
        video.currentTime = VIDEO_START_SECONDS;
      } else {
        video.play().catch(() => {});
      }
    };

    const handleSeeked = () => {
      video.play().catch(() => {});
    };

    const handlePlaying = () => {
      startAuthReveal();
    };

    const handleEnded = () => {
      if (video.duration > VIDEO_START_SECONDS) {
        video.currentTime = VIDEO_START_SECONDS;
      }
      video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", seekToStart);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 1) seekToStart();

    return () => {
      clearTimeout(authTimer);
      video.removeEventListener("loadedmetadata", seekToStart);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("playing", handlePlaying);
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
          src={bgVideo}
          preload="auto"
          muted
          playsInline
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(160deg, rgba(10,25,49,0.44) 0%, rgba(26,61,99,0.22) 42%, rgba(10,25,49,0.50) 100%)",
          }}
        />

        <motion.div
          className="absolute inset-0"
          animate={{
            background: showAuthBox
              ? "linear-gradient(to right, rgba(10,25,49,0.30) 0%, rgba(10,25,49,0.46) 38%, rgba(10,25,49,0.68) 62%, rgba(10,25,49,0.80) 100%)"
              : "linear-gradient(to right, rgba(10,25,49,0.50) 0%, rgba(10,25,49,0.42) 45%, rgba(10,25,49,0.38) 100%)",
          }}
          transition={transition}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 25% 50%, rgba(74,127,167,0.1) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* ── Top bar ── */}
      <header
        className="relative z-20 w-full flex items-center justify-between gap-3 px-5 sm:px-8 lg:px-10 py-2 shrink-0"
        style={{
          background: C.inputBg,
          borderBottom: "1.5px solid rgba(179,207,229,0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Logo size={30} titleOnly />
        <p
          className="text-[9px] sm:text-[10px] lg:text-xs text-right max-w-[180px] sm:max-w-none leading-tight"
          style={{ color: C.light, opacity: 0.9 }}
        >
          Where Recovery Never Stops
        </p>
      </header>

      {/* ── Content: centered hero → splits left + form ── */}
      <div
        className={`relative z-10 flex flex-1 w-full ${
          showAuthBox ? "flex-col lg:flex-row" : "items-center justify-center"
        }`}
      >
        <motion.div
          layout
          transition={transition}
          className={`flex items-center justify-center px-8 py-10 lg:px-14 lg:py-12 ${
            showAuthBox
              ? "w-full lg:w-[58%] min-h-[40vh] lg:min-h-0"
              : "w-full flex-1"
          }`}
        >
          <motion.div
            layout
            transition={transition}
            className="flex flex-col items-center text-center max-w-xl w-full gap-8 lg:gap-10"
          >
            <div className="relative flex flex-col gap-5">
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "-2.5rem",
                  bottom: "-2.5rem",
                  left: "-3rem",
                  right: "-3rem",
                  background:
                    "radial-gradient(ellipse 85% 75% at 50% 50%, rgba(10,25,49,0.72) 0%, rgba(10,25,49,0.4) 42%, transparent 72%)",
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
                      "drop-shadow(0 2px 10px rgba(93,158,214,0.45)) drop-shadow(0 4px 18px rgba(0,0,0,0.28))",
                  }}
                >
                  Rehabilitation
                </span>
                <span className="block" style={{ color: C.white, marginTop: -10 }}>
                  Support
                </span>
              </h1>
              <p
                className="relative z-10 text-base sm:text-lg leading-relaxed max-w-md mx-auto"
                style={{ color: C.light, opacity: 0.92 }}
              >
                Track progress, guide exercises, and connect families with specialists through smart daily follow-up.
              </p>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showAuthBox && (
            <motion.div
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
              className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-10 min-h-[45vh] lg:min-h-0"
            >
              <div className="w-full max-w-[420px]">
                <div
                  className="rounded-3xl p-7 relative overflow-hidden"
                  style={{
                    background: G.cardBg,
                    border: "1.5px solid rgba(179,207,229,0.28)",
                    backdropFilter: "blur(20px)",
                    boxShadow: `0 0 40px ${G.glowSoft}, 0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${G.borderFocus}, transparent)` }}
                  />

                  <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(10,25,49,0.6)" }}>
                    {["signin", "signup"].map((t) => (
                      <button
                        key={t}
                        onClick={() => onTabChange(t)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                        style={
                          activeTab === t
                            ? {
                                background: G.tabActive,
                                color: C.white,
                                boxShadow: `0 2px 8px ${G.glow}`,
                              }
                            : { color: C.light, opacity: 0.6 }
                        }
                      >
                        {t === "signin" ? "Sign In" : "Create Account"}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: activeTab === "signin" ? -16 : 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: activeTab === "signin" ? 16 : -16 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className={scrollable ? "max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin" : ""}>
                        {children}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ── */}
      <footer
        className="relative z-20 w-full flex items-center justify-center px-5 py-2 shrink-0"
        style={{
          background: C.inputBg,
          borderTop: "1px solid rgba(179,207,229,0.2)",
          backdropFilter: "blur(20px)",
        }}
      >
        <p className="text-[10px] sm:text-xs" style={{ color: C.light, opacity: 0.85 }}>
          © Smart Rehabilitation Platform
        </p>
      </footer>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(74,127,167,0.25); border-radius: 99px; }
        input::placeholder { color: rgba(179,207,229,0.45); }
      `}</style>
    </div>
  );
}
