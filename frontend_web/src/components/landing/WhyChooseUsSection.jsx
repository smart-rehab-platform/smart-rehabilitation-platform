import closeIcon from "../../assets/icons/close.svg";
import taskAltIcon from "../../assets/icons/task_alt.svg";
import { L } from "./landingTokens";
const COMPARISONS = [
  {
    traditional: "Scattered communication",
    smart: "One connected platform",
  },
  {
    traditional: "Paper-based progress",
    smart: "Visual progress analytics",
  },
  {
    traditional: "Limited home guidance",
    smart: "Guided daily exercises",
  },
  {
    traditional: "Delayed feedback",
    smart: "Direct specialist reviews",
  },
  {
    traditional: "Manual summaries",
    smart: "AI-assisted summaries",
  },
  {
    traditional: "Separate tools",
    smart: "Mobile + Web + AI ecosystem",
  },
];

const TRADITIONAL_HEADER = {
  background: "#FFF9F1",
  border: "#F4D3A6",
  text: "#B65A24",
};

const SMART_HEADER = {
  background: "#1A416B",
  border: "#1A416B",
  text: "#FFFFFF",
};

const TRADITIONAL_ROW = {
  background: "#FAFAFA",
  border: "rgba(15, 35, 66, 0.08)",
  text: "#597392",
  iconBg: "rgba(239, 68, 68, 0.10)",
  hoverBg: "#FFF5F0",
};

const SMART_ROW = {
  background: "#F5FAFE",
  border: "rgba(42, 164, 201, 0.20)",
  text: "#294A6D",
  iconBg: "rgba(34, 197, 94, 0.10)",
  hoverBg: "#EDF6FD",
  hoverBorder: "rgba(42, 164, 201, 0.32)",
};

function ColumnHeader({ variant }) {
  const isTraditional = variant === "traditional";
  const styles = isTraditional ? TRADITIONAL_HEADER : SMART_HEADER;

  return (
    <div
      className="flex h-[50px] items-center justify-center rounded-xl border px-4 text-center text-[14px] font-semibold md:text-[15px]"
      style={{
        background: styles.background,
        borderColor: styles.border,
        color: styles.text,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {isTraditional ? "Traditional Follow-Up" : "Smart Rehabilitation"}
    </div>
  );
}

function ComparisonMaterialIcon({ src, className = "h-5 w-5 object-contain" }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={className}
    />
  );
}

function ComparisonRow({ variant, text }) {
  const isTraditional = variant === "traditional";
  const styles = isTraditional ? TRADITIONAL_ROW : SMART_ROW;
  const iconSrc = isTraditional ? closeIcon : taskAltIcon;

  return (
    <div
      className={`why-choose-row flex min-h-[46px] items-center gap-3 rounded-xl border px-4 py-2.5 ${isTraditional ? "why-choose-row-traditional" : "why-choose-row-smart"}`}
      style={{
        background: styles.background,
        borderColor: styles.border,
      }}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: styles.iconBg }}
      >
        <ComparisonMaterialIcon
          src={iconSrc}
          className={isTraditional ? "h-4 w-4 object-contain" : "h-5 w-5 object-contain"}
        />
      </span>
      <span
        className="text-left text-[14px] leading-snug"
        style={{ color: styles.text, fontFamily: "'Inter', sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
}

export function WhyChooseUsSection() {
  return (
    <section
      id="about"
      className="overflow-hidden px-5 py-16 md:py-24 lg:px-8 lg:py-[120px]"
      style={{ background: "#FAFCFE" }}
      aria-labelledby="why-choose-us-heading"
    >
      <div className="mx-auto max-w-[820px]">
        <header className="mb-10 text-center md:mb-12 lg:mb-14">
          <p
            className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] md:mb-4 md:text-[13px]"
            style={{ color: L.primary, fontFamily: "'Inter', sans-serif" }}
          >
            WHY CHOOSE US
          </p>
          <h2
            id="why-choose-us-heading"
            className="text-[2rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3.25rem]"
            style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
          >
            Why Smart Rehabilitation?
          </h2>
        </header>

        <div className="hidden md:block">
          <div className="mb-3 grid grid-cols-2 gap-4">
            <ColumnHeader variant="traditional" />
            <ColumnHeader variant="smart" />
          </div>
          <div className="flex flex-col gap-2.5">
            {COMPARISONS.map((row) => (
              <div key={row.traditional} className="grid grid-cols-2 gap-4">
                <ComparisonRow variant="traditional" text={row.traditional} />
                <ComparisonRow variant="smart" text={row.smart} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:hidden">
          {COMPARISONS.map((row) => (
            <div key={row.traditional} className="flex flex-col gap-2">
              <ComparisonRow variant="traditional" text={row.traditional} />
              <ComparisonRow variant="smart" text={row.smart} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .why-choose-row {
          transition: background-color 220ms ease, border-color 220ms ease, transform 220ms ease;
        }

        @media (hover: hover) {
          .why-choose-row-traditional:hover {
            background: ${TRADITIONAL_ROW.hoverBg};
          }

          .why-choose-row-smart:hover {
            background: ${SMART_ROW.hoverBg};
            border-color: ${SMART_ROW.hoverBorder};
            transform: translateY(-1px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .why-choose-row-smart:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
