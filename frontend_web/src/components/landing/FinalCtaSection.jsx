import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import arrowRightAltIcon from "../../assets/icons/arrow_right_alt.svg";
import { L } from "./landingTokens";

const BENEFITS = [
  "Get Started in Minutes",
  "AI-Assisted Rehabilitation",
  "Mobile & Web Access",
  "Secure Role-Based Platform",
];

const CTA_BG = "#102847";

export function FinalCtaSection() {
  return (
    <section
      id="join-us"
      className="relative overflow-hidden px-5 py-16 md:py-24 lg:px-8 lg:py-28"
      style={{ background: CTA_BG }}
      aria-labelledby="final-cta-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-16 md:top-20 -translate-x-1/2 w-[min(680px,88vw)] h-[320px] md:h-[380px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(79,166,248,0.18) 0%, rgba(79,166,248,0.05) 48%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div
          className="inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm md:text-[12px]"
          style={{
            background: L.accentSoft,
            color: L.primaryLight,
            borderColor: L.accentBorder,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          JOIN THE PLATFORM
        </div>

        <h2
          id="final-cta-heading"
          className="mt-8 text-[2.125rem] leading-[1.1] tracking-tight sm:text-[2.5rem] md:mt-10 md:text-[3rem] lg:text-[3.75rem] lg:leading-[1.08]"
          style={{ fontFamily: "'Playfair Display', serif", color: L.text }}
        >
          Ready to Start the Rehabilitation Journey?
        </h2>

        <p
          className="mx-auto mt-6 max-w-[700px] px-2 text-base leading-relaxed md:mt-7 md:text-[17px]"
          style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
        >
          Join one connected platform that empowers families, specialists, and administrators to
          deliver better rehabilitation outcomes through collaboration and AI-powered support.
        </p>

        <ul
          className="mx-auto mt-8 grid max-w-[720px] grid-cols-2 gap-x-6 gap-y-4 md:mt-10 md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-8 lg:gap-x-8"
          aria-label="Platform benefits"
        >
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center justify-center gap-2 text-left md:justify-start"
            >
              <Check
                size={16}
                strokeWidth={2.5}
                className="shrink-0"
                style={{ color: L.primary }}
                aria-hidden="true"
              />
              <span
                className="text-[14px] md:text-[15px]"
                style={{ color: "#C7D6E8", fontFamily: "'Inter', sans-serif" }}
              >
                {benefit}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row md:mt-12">
          <Link
            to="/signup"
            className="final-cta-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white sm:w-auto"
            style={{
              background: L.gradientButton,
              fontFamily: "'Inter', sans-serif",
              boxShadow: `0 4px 24px ${L.hoverGlow}`,
            }}
          >
            Get Started
            <img
              src={arrowRightAltIcon}
              alt=""
              aria-hidden="true"
              className="final-cta-primary-arrow h-5 w-5 shrink-0 object-contain brightness-0 invert"
            />
          </Link>
          <Link
            to="/login"
            className="final-cta-secondary inline-flex w-full items-center justify-center rounded-xl border px-7 py-3.5 text-[15px] font-semibold sm:w-auto"
            style={{
              color: L.textMuted,
              borderColor: L.border,
              background: "transparent",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>

      <style>{`
        .final-cta-primary-arrow {
          transition: transform 200ms ease;
        }

        @media (hover: hover) {
          .final-cta-primary:hover .final-cta-primary-arrow {
            transform: translateX(3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .final-cta-primary:hover .final-cta-primary-arrow {
            transform: none;
          }
        }

        .final-cta-primary,
        .final-cta-secondary {
          transition:
            background 220ms ease,
            border-color 220ms ease,
            color 220ms ease,
            box-shadow 220ms ease,
            transform 220ms ease;
        }

        .final-cta-primary:focus-visible,
        .final-cta-secondary:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 166, 248, 0.28);
        }

        @media (hover: hover) {
          .final-cta-primary:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #5BB0FF 0%, #78D0FF 100%);
            box-shadow: 0 8px 32px rgba(79, 166, 248, 0.32);
          }

          .final-cta-secondary:hover {
            background: rgba(79, 166, 248, 0.08);
            border-color: #4FA6F8;
            color: #4FA6F8;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .final-cta-primary:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
