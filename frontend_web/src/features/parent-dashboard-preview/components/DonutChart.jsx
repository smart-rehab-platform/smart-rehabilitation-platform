import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function DonutChart({
  percent = 0,
  label = "Overall Progress",
  size = 168,
  animated = true,
  animationKey = "default",
  duration = 1100,
  hideLabel = false,
}) {
  const safeTarget = Math.max(0, Math.min(100, percent));
  const radius = size * 0.38;
  const stroke = Math.max(9, size * 0.085);
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animated && !reducedMotion;

  const [drawPercent, setDrawPercent] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return undefined;

    const start = performance.now();
    let frameId = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDrawPercent(safeTarget * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [safeTarget, animationKey, shouldAnimate, duration]);

  const effectiveDraw = shouldAnimate ? drawPercent : safeTarget;
  const strokeOffset = circumference - (effectiveDraw / 100) * circumference;
  const displayPercent = Math.round(effectiveDraw);

  return (
    <div
      className="pd-donut pd-donut-animated"
      style={{ width: size, height: size }}
      aria-label={`${displayPercent}% ${label}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="pd-donut-svg"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--pd-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--pd-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="pd-donut-ring"
        />
      </svg>
      <div className="pd-donut-center">
        <strong>{displayPercent}%</strong>
        {!hideLabel ? <span>{label}</span> : null}
      </div>
    </div>
  );
}
