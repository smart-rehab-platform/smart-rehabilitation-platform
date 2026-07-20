import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import calendarMonthIcon from "../../assets/icons/calendar-month.svg";
import chartBarIcon from "../../assets/icons/chart-bar.svg";
import clipboardCheckMultipleIcon from "../../assets/icons/clipboard-check-multiple.svg";
import folderOpenIcon from "../../assets/icons/folder-open.svg";
import homeIcon from "../../assets/icons/home.svg";
import messageIcon from "../../assets/icons/message.svg";
import stethoscopeIcon from "../../assets/icons/stethoscope.svg";
import { L } from "./landingTokens";

const CARD_GAP = 24;
const SWIPE_THRESHOLD = 48;

const MODULES = [
  {
    icon: folderOpenIcon,
    title: "Case Management",
    description: "Manage every rehabilitation request from submission until patient conversion.",
    features: [
      "Case intake requests",
      "Category-based assignment",
      "Assessment workflow",
      "Patient conversion",
      "Parent & specialist linking",
    ],
  },
  {
    icon: clipboardCheckMultipleIcon,
    title: "Treatment Management",
    description: "Create personalized rehabilitation plans and monitor long-term treatment goals.",
    features: [
      "Assessments",
      "Treatment plans",
      "Short-term goals",
      "Long-term goals",
      "Goal progress tracking",
    ],
  },
  {
    icon: homeIcon,
    title: "Home Exercise Support",
    description: "Support families with daily rehabilitation exercises and home follow-up.",
    features: [
      "Daily & weekly tasks",
      "Exercise instructions",
      "Video, audio & image submissions",
      "Parent notes",
      "Retry workflow",
    ],
  },
  {
    icon: stethoscopeIcon,
    title: "Specialist Review",
    description: "Review patient submissions and provide professional rehabilitation feedback.",
    features: [
      "Submission review",
      "Performance rating",
      "Written feedback",
      "Approve or request retry",
      "Review history",
    ],
  },
  {
    icon: calendarMonthIcon,
    title: "Sessions",
    description: "Manage rehabilitation appointments and online therapy sessions.",
    features: [
      "Upcoming sessions",
      "Online session links",
      "Session requests",
      "Approval & rejection",
      "Completed, cancelled & missed",
    ],
  },
  {
    icon: messageIcon,
    title: "Communication",
    description: "Keep parents and specialists connected through secure communication.",
    features: [
      "Parent-specialist chat",
      "Online & last seen",
      "Images, audio, video & PDF",
      "Read status",
      "Unread notifications",
    ],
  },
  {
    icon: chartBarIcon,
    title: "Progress & Reports",
    description: "Track rehabilitation progress with intelligent analytics and reports.",
    features: [
      "Daily, weekly & monthly progress",
      "Goal completion",
      "Improvement percentage",
      "Specialist reports",
      "PDF exports",
    ],
  },
];

function ModuleIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="module-icon-image block h-[34px] w-[34px] object-contain"
    />
  );
}

function ModuleCard({ module, isActive }) {
  return (
    <article
      className="module-carousel-card flex h-full flex-col rounded-3xl border p-8"
      style={{
        background: L.lightBg,
        borderColor: L.modulesCardBorder,
        boxShadow: L.modulesCardShadow,
      }}
    >
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: L.lightIconBg }}
        aria-hidden="true"
      >
        <ModuleIcon src={module.icon} />
      </div>

      <h3
        className="mb-2 text-[22px] font-semibold leading-snug"
        style={{ color: L.sectionHeading, fontFamily: "'Inter', sans-serif" }}
      >
        {module.title}
      </h3>

      <p
        className="mb-5 text-[15px] leading-relaxed"
        style={{ color: L.modulesBody, fontFamily: "'Inter', sans-serif" }}
      >
        {module.description}
      </p>

      <ul className="mb-6 flex flex-1 flex-col gap-2">
        {module.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-[14px] leading-snug"
            style={{ color: L.modulesBody, fontFamily: "'Inter', sans-serif" }}
          >
            <span style={{ color: L.primary }} aria-hidden="true">
              •
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="module-carousel-cta inline-flex items-center gap-2 self-start rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-all duration-300"
        style={{
          color: L.primary,
          background: "transparent",
          border: `1px solid ${L.modulesCardBorder}`,
          fontFamily: "'Inter', sans-serif",
        }}
        tabIndex={isActive ? 0 : -1}
      >
        Explore Module
        <ArrowRight size={16} />
      </button>
    </article>
  );
}

export function PlatformModulesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(520);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const dragStartX = useRef(0);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);

  const updateMetrics = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    const mobile = width < 768;
    const nextCardWidth = mobile
      ? Math.max(280, width - 32)
      : Math.min(520, Math.floor((width - CARD_GAP * 2) / 1.54));

    setCardWidth(nextCardWidth);
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener("resize", updateMetrics);
    return () => window.removeEventListener("resize", updateMetrics);
  }, [updateMetrics]);

  const goTo = useCallback((index) => {
    setActiveIndex(Math.max(0, Math.min(MODULES.length - 1, index)));
  }, []);

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const finishDrag = useCallback(() => {
    const offset = dragOffsetRef.current;
    if (offset > SWIPE_THRESHOLD) {
      goPrev();
    } else if (offset < -SWIPE_THRESHOLD) {
      goNext();
    }
    dragOffsetRef.current = 0;
    setDragOffset(0);
    isDraggingRef.current = false;
    setIsDragging(false);
  }, [goNext, goPrev]);

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragStartX.current = event.clientX;
    dragOffsetRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!isDraggingRef.current) return;
    const nextOffset = event.clientX - dragStartX.current;
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const onPointerUp = (event) => {
    if (!isDraggingRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  };

  const onPointerCancel = () => {
    if (!isDraggingRef.current) return;
    finishDrag();
  };

  const trackOffset = activeIndex * (cardWidth + CARD_GAP) + cardWidth / 2;

  return (
    <section
      id="features"
      className="overflow-hidden px-5 py-16 md:py-20 lg:px-8 lg:py-24"
      style={{ background: L.sectionSoftBg }}
      aria-labelledby="platform-modules-heading"
    >
      <header className="mx-auto mb-12 max-w-3xl text-center md:mb-14 lg:mb-16">
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] md:mb-4"
          style={{ color: L.primary, fontFamily: "'Inter', sans-serif" }}
        >
          PLATFORM MODULES
        </p>
        <h2
          id="platform-modules-heading"
          className="text-[2.125rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
          style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
        >
          Everything Needed for a Connected Rehabilitation Journey
        </h2>
        <p
          className="mx-auto mt-5 max-w-[760px] text-[16px] leading-relaxed md:mt-6 md:text-[17px] lg:text-[18px]"
          style={{ color: L.modulesBody, fontFamily: "'Inter', sans-serif" }}
        >
          Explore the complete Smart Rehabilitation Platform and discover how every module works
          together to support families, specialists, administrators, and patients throughout the
          rehabilitation journey.
        </p>
      </header>

      <div className="relative mx-auto max-w-[980px]">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex === 0}
          className="module-carousel-nav absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border p-2.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35 md:flex"
          style={{
            background: L.lightBg,
            borderColor: L.modulesCardBorder,
            color: L.primary,
            boxShadow: L.modulesCardShadow,
          }}
          aria-label="Previous module"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex === MODULES.length - 1}
          className="module-carousel-nav absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border p-2.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35 md:flex"
          style={{
            background: L.lightBg,
            borderColor: L.modulesCardBorder,
            color: L.primary,
            boxShadow: L.modulesCardShadow,
          }}
          aria-label="Next module"
        >
          <ChevronRight size={20} />
        </button>

        <div
          ref={containerRef}
          className="module-carousel-viewport overflow-hidden px-1 touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerCancel}
          role="region"
          aria-roledescription="carousel"
          aria-label="Platform modules carousel"
        >
          <div
            className="flex items-stretch"
            style={{
              gap: `${CARD_GAP}px`,
              transform: `translateX(calc(50% - ${trackOffset}px + ${dragOffset}px))`,
              transition: isDragging ? "none" : "transform 350ms ease",
            }}
          >
            {MODULES.map((module, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={module.title}
                  className="shrink-0"
                  style={{
                    width: `${cardWidth}px`,
                    opacity: isActive ? 1 : 0.6,
                    transform: isActive ? "scale(1.02)" : "scale(0.94)",
                    transition: isDragging
                      ? "none"
                      : "opacity 350ms ease, transform 350ms ease",
                  }}
                  aria-hidden={!isActive}
                >
                  <ModuleCard module={module} isActive={isActive} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {MODULES.map((module, index) => (
            <button
              key={module.title}
              type="button"
              onClick={() => goTo(index)}
              className="rounded-full transition-all duration-300"
              style={{
                width: index === activeIndex ? "24px" : "8px",
                height: "8px",
                background: index === activeIndex ? L.primary : "rgba(79, 166, 248, 0.25)",
              }}
              aria-label={`Go to ${module.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      </div>

      <style>{`
        .module-carousel-card {
          transition: background-color 300ms ease, box-shadow 300ms ease, transform 300ms ease;
        }

        @media (hover: hover) {
          .module-carousel-card:hover {
            background-color: ${L.modulesHoverBg};
            box-shadow: ${L.modulesCardShadowHover};
            transform: translateY(-3px);
          }

          .module-carousel-nav:not(:disabled):hover {
            background-color: ${L.modulesHoverBg};
          }

          .module-carousel-cta:hover {
            background-color: ${L.modulesHoverBg};
            border-color: rgba(79, 166, 248, 0.18);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .module-carousel-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
