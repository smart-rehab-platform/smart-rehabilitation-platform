import { useEffect, useRef } from "react";
import bgVideo from "../../assets/auth-bg.mp4";

const VIDEO_PLAYBACK_RATE = 0.5;

export function LandingHeroBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      video.pause();
      return undefined;
    }

    const playVideo = () => {
      video.playbackRate = VIDEO_PLAYBACK_RATE;
      video.play().catch(() => {});
    };

    video.playbackRate = VIDEO_PLAYBACK_RATE;
    video.addEventListener("canplay", playVideo);
    playVideo();

    return () => {
      video.removeEventListener("canplay", playVideo);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        className="landing-hero-bg-video absolute inset-0 h-full w-full object-cover"
        src={bgVideo}
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        disablePictureInPicture
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15, 35, 66, 0.68) 0%, rgba(19, 43, 77, 0.78) 100%)",
        }}
      />
      <style>{`
        .landing-hero-bg-video {
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-hero-bg-video {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
