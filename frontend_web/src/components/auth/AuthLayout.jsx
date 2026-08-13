import { Fragment, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import bgVideo from "../../assets/auth-bg.mp4";
import neurologyIcon from "../../assets/icons/neurology.svg";
import { Logo, BrandIcon } from "./Logo";
import { C, G } from "./tokens";
import { useSignupWizard } from "../../context/SignupWizardContext";

const VIDEO_START_SECONDS = 4;
const VIDEO_PLAYBACK_RATE = 0.5;

const HERO_GRADIENT =
  "linear-gradient(180deg, #A8E4FF 0%, #56B6E9 48%, #2AA4C9 100%)";

const CARD_HEADERS = {
  signin: {
    title: "Welcome Back",
    subtitle: "Sign in to continue",
  },
  signup: {
    title: "Create Your Account",
  },
};

const SIGNUP_ROLE_INTRO = "Choose how you'll use Smart Rehabilitation.";
const ONBOARDING_TOTAL_STEPS = 5;

const SIGNUP_WIZARD_HEADERS = {
  1: {
    title: "Create Your Account",
  },
  2: {
    subtitle: "Tell us a little about yourself.",
  },
  3: {
    subtitle: "Tell us about your professional background.",
  },
  4: {
    subtitle: "Secure your account with a strong password.",
  },
  5: {
    subtitle: "Review your details before creating your account.",
  },
};

function OnboardingProgressIndicator({ currentStep = 1, className = "" }) {
  return (
    <div className={`auth-onboarding-progress mb-4 flex flex-col items-center ${className}`}>
      <div
        className="auth-onboarding-progress-track flex items-center"
        aria-hidden
      >
        {Array.from({ length: ONBOARDING_TOTAL_STEPS }, (_, index) => {
          const stepNumber = index + 1;
          let dotClass = "auth-onboarding-progress-dot--inactive";

          if (stepNumber === currentStep) {
            dotClass = "auth-onboarding-progress-dot--active";
          } else if (stepNumber < currentStep) {
            dotClass = "auth-onboarding-progress-dot--completed";
          }

          return (
            <Fragment key={index}>
              {index > 0 && (
                <span
                  className={`auth-onboarding-progress-line ${
                    stepNumber <= currentStep
                      ? "auth-onboarding-progress-line--completed"
                      : ""
                  }`}
                />
              )}
              <span className={`auth-onboarding-progress-dot ${dotClass}`} />
            </Fragment>
          );
        })}
      </div>
      <p
        className="auth-onboarding-step-label mt-1.5 text-[15px] font-semibold leading-none tracking-[0.01em] sm:text-[16px]"
        style={{ color: "#3D5675" }}
      >
        Step {currentStep} of {ONBOARDING_TOTAL_STEPS}
      </p>
    </div>
  );
}

export function AuthLayout({ activeTab, onTabChange, children }) {
  const videoRef = useRef(null);
  const location = useLocation();
  const { wizardStep, isRegistrationSubmitting } = useSignupWizard();
  const isLoginOrSignup = location.pathname === "/login" || location.pathname === "/signup";
  const header = CARD_HEADERS[activeTab] ?? CARD_HEADERS.signin;
  const signupHeader = SIGNUP_WIZARD_HEADERS[wizardStep] ?? SIGNUP_WIZARD_HEADERS[1];
  const isSignupCompactIntro =
    activeTab === "signup" && (wizardStep === 2 || wizardStep === 3 || wizardStep === 4 || wizardStep === 5);
  const showSignupHeaderAboveTabs = activeTab === "signup" && wizardStep === 1;
  const segmentMarginClass = isSignupCompactIntro
    ? "mb-3"
    : activeTab === "signup"
      ? "mb-4"
      : "mb-7";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      video.pause();
      return undefined;
    }

    let hasSeekedToStart = false;

    const playVideo = () => {
      video.playbackRate = VIDEO_PLAYBACK_RATE;
      video.play().catch(() => {});
    };

    const seekToStart = () => {
      if (hasSeekedToStart || !Number.isFinite(video.duration) || video.duration <= VIDEO_START_SECONDS) {
        return;
      }
      hasSeekedToStart = true;
      video.currentTime = VIDEO_START_SECONDS;
    };

    const handleLoadedMetadata = () => {
      seekToStart();
    };

    const handleEnded = () => {
        video.currentTime = VIDEO_START_SECONDS;
      playVideo();
    };

    video.playbackRate = VIDEO_PLAYBACK_RATE;

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", playVideo);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 1) {
      seekToStart();
    }

    playVideo();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div
      className="auth-page relative flex min-h-screen w-full flex-col overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: C.navy }}
    >
      {/* ── Full-page background video ── */}
      <div className="auth-bg-layer absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          className="auth-bg-video absolute inset-0 h-full w-full object-cover"
          src={bgVideo}
          preload="metadata"
          autoPlay
          muted
          playsInline
          disablePictureInPicture
        />

        <div
          className="auth-bg-tone absolute inset-0 pointer-events-none"
          aria-hidden
        />
      </div>

      {/* ── Unified authentication panel ── */}
      <div className="relative z-10 flex w-full flex-1 flex-col">
        <div className="auth-panel-stage mx-auto flex w-full flex-1 items-center justify-center px-3.5 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="auth-panel auth-panel-enter w-full">
            <header className="auth-panel-header">
              <div className="auth-panel-header-brand">
                <BrandIcon size={34} color="#56B6E9" />
                <div className="auth-panel-header-wordmark" aria-label="Smart Rehabilitation">
                  <span className="auth-panel-header-wordmark-smart">SMART</span>
                  <span className="auth-panel-header-wordmark-rehab">REHABILITATION</span>
                </div>
              </div>
      </header>

            {/* Two-column body */}
            <div className="auth-panel-body">
              {/* Left — hero */}
              <div className="auth-panel-hero">
                <div className="auth-panel-hero-waves" aria-hidden />
                <div className="auth-panel-hero-content">
                  <div className="auth-panel-hero-inner">
                  <div className="auth-panel-hero-brand">
                    <Logo maxHeight={200} centered brandAsset="hero" />
                  </div>

                  <h1
                    className="auth-panel-headline w-full font-extrabold"
                style={{
                  fontFamily: "'Syne', sans-serif",
                      textShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
                    }}
                  >
                    <div className="auth-hero-lead-wrap">
                      <span
                        className="auth-hero-lead block font-semibold"
                        style={{
                          color: C.white,
                          fontSize: "clamp(28px, 2.3vw, 38px)",
                          fontWeight: 600,
                        }}
                      >
                        Empowering Every
                </span>
                    </div>
                    <span className="auth-hero-gradient-wrap mb-1 block w-full overflow-visible">
                <span
                        className="inline-block overflow-visible"
                  style={{
                          fontSize: "clamp(36px, 3.05vw, 46px)",
                          fontWeight: 800,
                          lineHeight: 1,
                          background: HERO_GRADIENT,
                    WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                          color: "transparent",
                  }}
                >
                  Rehabilitation
                </span>
                    </span>
                    <span
                      className="block"
                      style={{
                        color: C.white,
                        fontSize: "clamp(44px, 3.85vw, 56px)",
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      Journey
                </span>
                    <span className="auth-hero-accent-line" aria-hidden />
              </h1>

                  <p className="auth-panel-hero-desc">
                    Smart therapy, personalized progress, and seamless collaboration between
                    specialists and families.
              </p>
            </div>
                </div>
                <Link
                  to="/"
                  className="auth-back-home auth-panel-hero-back-home transition-all duration-200 ease-in-out focus-visible:outline-none"
                >
                  ← Back to Home
                </Link>
              </div>

              {/* Right — form */}
              <div className="auth-panel-form">
                <div className="auth-panel-form-ai-wrap">
                  <div
                    className="auth-ai-badge auth-panel-form-ai-badge inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase"
                  style={{
                      color: "#2AA4C9",
                      background: "rgba(79, 166, 248, 0.1)",
                      border: "1px solid rgba(79, 166, 248, 0.22)",
                    }}
                  >
                    <img
                      src={neurologyIcon}
                      alt=""
                      aria-hidden
                      className="h-[14px] w-[14px] shrink-0 object-contain"
                    />
                    Smart Rehabilitation AI
                  </div>
                </div>
                <div className="auth-panel-form-content">
                  {(isLoginOrSignup && activeTab === "signin") || showSignupHeaderAboveTabs ? (
                    <div className="auth-form-header mb-7 text-center">
                    {showSignupHeaderAboveTabs && (
                      <OnboardingProgressIndicator currentStep={wizardStep} />
                    )}
                    <h2
                      className="text-[1.875rem] font-bold leading-[1.2] sm:text-[2rem]"
                      style={{ fontFamily: "'Syne', sans-serif", color: "#0F2342", fontWeight: 700 }}
                    >
                      {activeTab === "signup" ? signupHeader.title : header.title}
                    </h2>
                    {activeTab === "signin" && header.subtitle && (
                      <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "#5A7390" }}>
                        {header.subtitle}
                      </p>
                    )}
                  </div>
                ) : null}

                <div className={`auth-segment relative flex rounded-2xl p-1 ${segmentMarginClass}`}>
                  <div
                    className="auth-segment-indicator absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-transform duration-300 ease-out"
                    style={{
                      background: G.tabActive,
                      boxShadow: "0 6px 16px rgba(42, 164, 201, 0.28)",
                      transform: activeTab === "signup" ? "translateX(calc(100% + 4px))" : "translateX(0)",
                    }}
                    aria-hidden
                  />
                    {["signin", "signup"].map((t) => (
                      <button
                        key={t}
                      type="button"
                        onClick={() => onTabChange(t)}
                      disabled={isRegistrationSubmitting}
                      className="auth-segment-btn relative z-10 flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55"
                      style={{
                        color: activeTab === t ? C.white : "#3D5675",
                        opacity: activeTab === t ? 1 : 0.88,
                      }}
                      >
                        {t === "signin" ? "Sign In" : "Create Account"}
                      </button>
                    ))}
                  </div>

                {isSignupCompactIntro && (
                  <div className="auth-signup-wizard-intro text-center">
                    <OnboardingProgressIndicator
                      currentStep={wizardStep}
                      className="!mb-3"
                    />
                    <p
                      className="auth-form-section-subtitle mb-7 text-[15px] font-semibold leading-relaxed"
                      style={{ color: "#3D5675" }}
                    >
                      {signupHeader.subtitle}
                    </p>
                  </div>
                )}

                {activeTab === "signup" && wizardStep === 1 && (
                  <p
                    className="auth-form-section-subtitle mb-7 text-center text-[15px] leading-relaxed"
                    style={{ color: "#5A7390" }}
                  >
                    {SIGNUP_ROLE_INTRO}
                  </p>
                )}

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
        .auth-bg-video {
          transform: scaleX(-1) translateZ(0);
          backface-visibility: hidden;
        }

        .auth-bg-tone {
          background:
            linear-gradient(160deg, rgba(15, 35, 66, 0.28) 0%, rgba(18, 40, 70, 0.14) 42%, rgba(15, 35, 66, 0.32) 100%),
            linear-gradient(to right, rgba(15, 35, 66, 0.2) 0%, rgba(15, 35, 66, 0.3) 38%, rgba(15, 35, 66, 0.48) 62%, rgba(15, 35, 66, 0.58) 100%),
            radial-gradient(ellipse at 25% 50%, rgba(79, 166, 248, 0.1) 0%, transparent 55%);
        }

        @keyframes authPanelEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes authHeroBrandGlow {
          0%,
          100% {
            opacity: 0.36;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 0.82;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        .auth-panel-enter {
          animation: authPanelEnter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .auth-panel-stage {
          width: 100%;
        }

        .auth-panel {
          width: min(1180px, calc(100vw - 28px));
          min-height: 590px;
          border-radius: 24px;
          overflow: hidden;
          background: transparent;
          border: 1px solid rgba(150, 205, 255, 0.22);
          box-shadow:
            0 28px 80px rgba(0, 15, 40, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.06) inset;
          display: flex;
          flex-direction: column;
        }

        .auth-panel-header {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 16px;
          padding: 14px 28px;
          background:
            radial-gradient(ellipse 80% 120% at 12% 0%, rgba(13, 45, 82, 0.55) 0%, transparent 62%),
            linear-gradient(165deg, #0a192f 0%, #05162d 100%);
          border-bottom: 1px solid rgba(110, 160, 205, 0.24);
        }

        @media (min-width: 640px) {
          .auth-panel-header {
            padding: 16px 40px;
          }
        }

        .auth-panel-header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .auth-panel-header-wordmark {
          display: flex;
          flex-direction: column;
          gap: 1px;
          line-height: 1;
        }

        .auth-panel-header-wordmark-smart {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #ffffff;
        }

        .auth-panel-header-wordmark-rehab {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #56b6e9;
        }

        .auth-panel-form-ai-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
          margin-bottom: 1rem;
        }

        .auth-panel-form-ai-badge {
          max-width: calc(100% - 16px);
        }

        @media (max-width: 479px) {
          .auth-panel-form-ai-badge {
            font-size: 9px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        @media (min-width: 640px) {
          .auth-panel {
            width: min(1180px, calc(100vw - 96px));
            border-radius: 32px;
          }
        }

        .auth-panel-body {
          display: grid;
          grid-template-columns: 1fr;
          flex: 1;
          min-height: 0;
        }

        @media (min-width: 980px) {
          .auth-panel-body {
            grid-template-columns: minmax(500px, 0.57fr) minmax(390px, 0.43fr);
            min-height: 540px;
          }
        }

        .auth-panel-form {
          order: 2;
          display: flex;
          flex-direction: column;
          background: rgba(238, 247, 255, 0.92);
          padding: 24px 28px 32px;
        }

        @media (min-width: 640px) {
          .auth-panel-form {
            padding: 26px 40px 36px;
          }
        }

        .auth-panel-form-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
        }

        .auth-panel-hero {
          order: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          overflow: visible;
          background:
            radial-gradient(ellipse 75% 55% at 38% 28%, rgba(13, 45, 82, 0.52) 0%, transparent 58%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(5, 22, 45, 0.48) 0%, transparent 55%),
            linear-gradient(165deg, rgba(10, 25, 47, 0.58) 0%, rgba(5, 22, 45, 0.52) 52%, rgba(3, 14, 26, 0.48) 100%);
          backdrop-filter: blur(14px) saturate(125%);
          -webkit-backdrop-filter: blur(14px) saturate(125%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
          padding: 26px 28px 32px;
        }

        @media (min-width: 640px) {
          .auth-panel-hero {
            padding: 28px 40px 36px;
          }
        }

        @media (min-width: 980px) {
          .auth-panel-hero {
            border-right: 1px solid rgba(110, 160, 205, 0.22);
          }
        }

        .auth-panel-hero-waves {
          pointer-events: none;
          position: absolute;
          inset: 0;
          overflow: hidden;
          background:
            radial-gradient(ellipse 50% 38% at 88% 8%, rgba(86, 182, 233, 0.1) 0%, transparent 68%),
            radial-gradient(ellipse 55% 42% at 55% 98%, rgba(42, 164, 201, 0.08) 0%, transparent 65%);
        }

        .auth-panel-hero-waves::before,
        .auth-panel-hero-waves::after {
          content: "";
          position: absolute;
          width: 280px;
          height: 120px;
          opacity: 0.42;
          background-image: radial-gradient(circle, rgba(86, 182, 233, 0.55) 1px, transparent 1px);
          background-size: 10px 10px;
          mask-image: radial-gradient(ellipse 85% 70% at 50% 50%, #000 25%, transparent 72%);
        }

        .auth-panel-hero-waves::before {
          top: 6%;
          right: -4%;
          transform: rotate(-8deg);
        }

        .auth-panel-hero-waves::after {
          bottom: 4%;
          left: 18%;
          transform: rotate(6deg);
          opacity: 0.32;
        }

        .auth-panel-hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
          transform: translateY(-18px);
        }

        @media (max-width: 979px) {
          .auth-panel-form {
            border-top: 1px solid rgba(110, 160, 205, 0.18);
          }
        }

        .auth-panel-hero-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 560px;
          text-align: center;
          overflow: visible;
        }

        @media (min-width: 980px) {
          .auth-panel-hero-inner {
            text-align: left;
          }
        }

        .auth-panel-hero-brand {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .auth-panel-hero-brand::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 0;
          width: clamp(170px, 36vw, 230px);
          height: clamp(170px, 36vw, 230px);
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(
            circle at center,
            rgba(120, 195, 255, 0.55) 0%,
            rgba(79, 166, 248, 0.32) 38%,
            rgba(42, 148, 210, 0.12) 62%,
            transparent 78%
          );
          filter: blur(28px);
          animation: authHeroBrandGlow 4.5s ease-in-out infinite;
        }

        .auth-panel-hero-brand::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 0;
          width: clamp(116px, 25vw, 156px);
          height: clamp(116px, 25vw, 156px);
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(
            circle at center,
            rgba(168, 228, 255, 0.38) 0%,
            rgba(86, 182, 233, 0.2) 50%,
            transparent 72%
          );
          filter: blur(16px);
          animation: authHeroBrandGlow 4.5s ease-in-out infinite reverse;
        }

        .auth-panel-hero-brand > * {
          position: relative;
          z-index: 1;
        }

        @media (min-width: 980px) {
          .auth-panel-hero-brand {
            justify-content: center;
          }
        }

        .auth-panel-hero-brand img {
          width: clamp(132px, 27vw, 172px) !important;
          height: auto !important;
          max-height: clamp(132px, 27vw, 172px) !important;
          object-fit: contain;
          filter:
            drop-shadow(0 0 18px rgba(79, 166, 248, 0.42))
            drop-shadow(0 0 36px rgba(42, 164, 201, 0.22))
            drop-shadow(0 8px 20px rgba(0, 0, 0, 0.18));
        }

        .auth-panel-headline {
          overflow: visible;
          max-width: none;
        }

        .auth-hero-lead-wrap {
          overflow: visible;
          margin-bottom: 0.75rem;
          padding-bottom: 4px;
        }

        .auth-hero-lead {
          display: block;
          overflow: visible;
          line-height: 1.2;
        }

        .auth-hero-accent-line {
          display: block;
          width: 72px;
          height: 3px;
          margin-top: 10px;
          border-radius: 999px;
          background: linear-gradient(90deg, #2aa4c9 0%, #56b6e9 55%, #8dd8f4 100%);
        }

        @media (min-width: 980px) {
          .auth-hero-accent-line {
            margin-left: 0;
            margin-right: auto;
          }
        }

        @media (max-width: 979px) {
          .auth-hero-accent-line {
            margin-left: auto;
            margin-right: auto;
          }
        }

        .auth-hero-gradient-wrap {
          overflow: visible;
          width: 100%;
        }

        .auth-panel-hero-desc {
          margin-top: 18px;
          max-width: 500px;
          font-size: clamp(16px, 1.5vw, 18px);
          line-height: 1.7;
          color: rgba(183, 200, 221, 0.82);
        }

        @media (min-width: 980px) {
          .auth-panel-hero-desc {
            margin-left: 0;
            margin-right: auto;
          }
        }

        @media (max-width: 979px) {
          .auth-panel-hero-desc {
            margin-left: auto;
            margin-right: auto;
          }
        }

        .auth-panel-hero-back-home {
          position: absolute;
          right: 28px;
          bottom: 18px;
          z-index: 2;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: rgba(183, 200, 221, 0.62);
        }

        @media (min-width: 640px) {
          .auth-panel-hero-back-home {
            right: 40px;
            bottom: 26px;
          }
        }

        .auth-segment {
          height: 52px;
          border-radius: 15px;
          background: rgba(140, 180, 220, 0.22);
          padding: 4px;
        }

        .auth-segment-indicator {
          border-radius: 12px;
        }

        .auth-onboarding-progress-dot {
          display: block;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .auth-onboarding-progress-dot--active {
          width: 11px;
          height: 11px;
          background: ${C.primary};
          opacity: 1;
          box-shadow:
            0 0 0 4px rgba(79, 166, 248, 0.22),
            0 0 14px rgba(79, 166, 248, 0.38);
        }

        .auth-onboarding-progress-dot--inactive {
          width: 9px;
          height: 9px;
          background: rgba(255, 255, 255, 0.65);
          border: 2px solid #B8C9DC;
        }

        .auth-onboarding-progress-dot--completed {
          width: 9px;
          height: 9px;
          background: ${C.primary};
          opacity: 0.88;
        }

        .auth-onboarding-progress-line {
          display: block;
          width: 32px;
          height: 2px;
          background: #B8C9DC;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .auth-onboarding-progress-line--completed {
          background: rgba(79, 166, 248, 0.42);
        }

        .auth-panel-form .auth-input {
          min-height: 54px;
          border-radius: 14px !important;
          background: rgba(255, 255, 255, 0.72) !important;
          color: #0f2342 !important;
          border-color: rgba(65, 150, 220, 0.18) !important;
          box-shadow: none !important;
        }

        .auth-panel-form .auth-input:focus {
          border-color: rgba(42, 164, 201, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(42, 164, 201, 0.12) !important;
        }

        .auth-panel-form .auth-input-label {
          color: #6b849f !important;
        }

        .auth-panel-form .auth-input:focus ~ .auth-input-label,
        .auth-panel-form .auth-input-label-floating {
          color: #5a7390 !important;
        }

        .auth-panel-form .auth-input:focus ~ .auth-input-label {
          color: ${C.primary} !important;
        }

        .auth-panel-form .auth-input-icon {
          color: ${C.primary} !important;
          opacity: 0.82 !important;
        }

        .auth-panel-form .auth-textarea {
          min-height: 84px;
          border-radius: 14px !important;
          background: rgba(255, 255, 255, 0.72) !important;
          color: #0f2342 !important;
          border-color: rgba(65, 150, 220, 0.18) !important;
          box-shadow: none !important;
          resize: none !important;
        }

        .auth-panel-form .auth-textarea:focus {
          border-color: rgba(42, 164, 201, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(42, 164, 201, 0.12) !important;
        }

        .auth-panel-form .auth-textarea:focus ~ .auth-textarea-label,
        .auth-panel-form .auth-textarea:focus ~ .auth-input-label,
        .auth-panel-form .auth-textarea-label.auth-input-label-floating,
        .auth-panel-form .auth-input-label-floating {
          color: #5a7390 !important;
        }

        .auth-panel-form .auth-textarea:focus ~ .auth-textarea-label,
        .auth-panel-form .auth-textarea:focus ~ .auth-input-label {
          color: ${C.primary} !important;
        }

        .auth-panel-form .auth-remember-row span {
          color: #3d5675 !important;
        }

        .auth-panel-form .auth-remember-row button {
          color: #4a6580 !important;
        }

        .auth-panel-form .auth-primary-btn {
          min-height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2aa4c9 0%, #56b6e9 100%) !important;
          box-shadow: 0 12px 28px rgba(42, 164, 201, 0.22) !important;
          font-weight: 700;
        }

        .auth-panel-form .auth-secondary-btn {
          width: 100%;
          min-height: 52px;
          border-radius: 14px;
          padding: 14px 20px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          color: #2aa4c9;
          background: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(42, 164, 201, 0.35);
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .auth-panel-form .auth-secondary-btn:hover {
          background: rgba(42, 164, 201, 0.08);
          border-color: #2aa4c9;
        }

        .auth-panel-form .auth-footer-text {
          color: #5a7390 !important;
          font-size: 11px;
        }

        .auth-panel-form .auth-footer-link {
          color: #2aa4c9 !important;
        }

        .auth-hero-glass-surface {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(110, 160, 205, 0.22);
          background:
            radial-gradient(ellipse 75% 55% at 38% 28%, rgba(13, 45, 82, 0.52) 0%, transparent 58%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(5, 22, 45, 0.48) 0%, transparent 55%),
            linear-gradient(165deg, rgba(10, 25, 47, 0.58) 0%, rgba(5, 22, 45, 0.52) 52%, rgba(3, 14, 26, 0.48) 100%);
          backdrop-filter: blur(14px) saturate(125%);
          -webkit-backdrop-filter: blur(14px) saturate(125%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
        }

        .auth-hero-glass-surface::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 38% at 88% 8%, rgba(86, 182, 233, 0.1) 0%, transparent 68%),
            radial-gradient(ellipse 55% 42% at 55% 98%, rgba(42, 164, 201, 0.08) 0%, transparent 65%);
        }

        .auth-panel-form .auth-hero-glass-surface {
          background:
            radial-gradient(ellipse 75% 55% at 38% 28%, rgba(13, 45, 82, 0.72) 0%, transparent 58%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(5, 22, 45, 0.68) 0%, transparent 55%),
            radial-gradient(ellipse 50% 38% at 88% 8%, rgba(86, 182, 233, 0.14) 0%, transparent 68%),
            radial-gradient(ellipse 55% 42% at 55% 98%, rgba(42, 164, 201, 0.1) 0%, transparent 65%),
            linear-gradient(165deg, rgba(10, 25, 47, 0.94) 0%, rgba(5, 22, 45, 0.9) 52%, rgba(3, 14, 26, 0.86) 100%);
        }

        .auth-hero-glass-surface-content {
          position: relative;
          z-index: 1;
        }

        .auth-panel-form .auth-upload-image-btn {
          color: ${C.primary} !important;
          background: rgba(79, 166, 248, 0.08) !important;
          border-color: rgba(79, 166, 248, 0.35) !important;
        }

        .auth-back-home:focus-visible {
          box-shadow: 0 0 0 3px rgba(79, 166, 248, 0.28);
          border-radius: 6px;
        }

        @media (hover: hover) {
          .auth-back-home:hover,
          .auth-panel-hero-back-home:hover {
            color: rgba(168, 228, 255, 0.88) !important;
          }

          .auth-back-home:hover {
            transform: translateX(-2px);
          }

          .auth-panel-form .auth-primary-btn:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 32px rgba(42, 164, 201, 0.28) !important;
          }

          .auth-panel-form .auth-primary-btn:not(:disabled):hover .auth-btn-arrow {
            transform: translateX(4px);
          }

          .auth-input-shell:focus-within .auth-input-icon {
            opacity: 1 !important;
            color: ${C.primary} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-bg-video {
            display: none;
          }

          .auth-panel-enter {
            animation: none;
            opacity: 1;
            transform: none;
          }

          .auth-back-home:hover,
          .auth-panel-form .auth-primary-btn:not(:disabled):hover {
            transform: none;
          }

          .auth-segment-indicator {
            transition: none !important;
          }

          .auth-panel-hero-brand::before,
          .auth-panel-hero-brand::after {
            animation: none;
            opacity: 0.5;
          }
        }

        .auth-btn-arrow {
          transition: transform 0.25s ease;
        }

        .auth-input-label {
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.2;
        }

        .auth-input:focus ~ .auth-input-label,
        .auth-input:not(:placeholder-shown) ~ .auth-input-label,
        .auth-input:-webkit-autofill ~ .auth-input-label,
        .auth-input-label-floating {
          top: 0.5rem;
          transform: translateY(0);
          font-size: 0.6875rem;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0.01em;
        }
      `}</style>
    </div>
  );
}
