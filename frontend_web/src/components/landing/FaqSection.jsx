import { useId, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale } from "../../context/useLocale.js";
import { buildLandingFaqItems } from "./landingLocalization.js";
import { L } from "./landingTokens";

function FaqAccordionItem({ item, index, isOpen, onToggle, idPrefix }) {
  const buttonId = `${idPrefix}-button-${index}`;
  const panelId = `${idPrefix}-panel-${index}`;

  return (
    <div
      className={`faq-item rounded-[15px] border bg-white ${isOpen ? "faq-item-open" : "faq-item-closed"}`}
      style={{
        borderColor: isOpen ? "rgba(42, 164, 201, 0.28)" : "rgba(15, 35, 66, 0.08)",
        background: isOpen ? "#FBFDFF" : "#FFFFFF",
        boxShadow: "0 6px 20px rgba(15, 35, 66, 0.05)",
      }}
    >
      <button
        type="button"
        id={buttonId}
        className="faq-item-button flex w-full items-center justify-between gap-4 px-5 py-4 text-start md:px-[22px] md:py-[17px]"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(index)}
      >
        <span
          className="text-[15px] font-semibold leading-snug md:text-[16px]"
          style={{ color: "#132B4D", fontFamily: "'Inter', sans-serif" }}
        >
          {item.question}
        </span>
        <span
          className="faq-chevron flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: isOpen ? "rgba(42, 164, 201, 0.12)" : "#F3F7FA",
          }}
          aria-hidden="true"
        >
          <ChevronDown
            size={18}
            className={`faq-chevron-icon transition-transform duration-[250ms] ease-in-out ${isOpen ? "rotate-180" : ""}`}
            style={{ color: isOpen ? L.primary : "#5E748F" }}
          />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-panel grid transition-[grid-template-rows,opacity] duration-[250ms] ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div
            className={`faq-answer-inner transition-[transform,opacity] duration-[250ms] ease-in-out ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
          >
            {isOpen && (
              <div
                className="mx-5 border-t md:mx-[22px]"
                style={{ borderColor: "rgba(15, 35, 66, 0.07)" }}
              />
            )}
            <p
              className="px-5 pb-[18px] pt-3 text-[14px] leading-[1.65] md:px-[22px] md:pb-[22px] md:text-[15px]"
              style={{ color: "#5E748F", fontFamily: "'Inter', sans-serif" }}
            >
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const { t } = useLocale();
  const faqItems = useMemo(() => buildLandingFaqItems(t), [t]);

  const [openIndex, setOpenIndex] = useState(0);
  const idPrefix = useId().replace(/:/g, "");

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="overflow-hidden px-5 pt-16 pb-12 md:pt-24 md:pb-16 lg:px-8 lg:pt-[120px] lg:pb-[72px]"
      style={{ background: L.sectionSoftBg }}
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[820px]">
        <header className="mb-10 text-center md:mb-12">
          <p
            className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] md:mb-4 md:text-[13px]"
            style={{ color: L.primary, fontFamily: "'Inter', sans-serif" }}
          >
            {t("landing.faq.eyebrow")}
          </p>
          <h2
            id="faq-heading"
            className="text-[2rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[2.75rem] lg:text-[3.25rem]"
            style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
          >
            {t("landing.faq.heading")}
          </h2>
        </header>

        <div className="flex flex-col gap-3">
          {faqItems.map((item, index) => (
            <FaqAccordionItem
              key={item.key}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={handleToggle}
              idPrefix={idPrefix}
            />
          ))}
        </div>
      </div>

      <style>{`
        .faq-item {
          transition:
            background-color 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease,
            transform 220ms ease;
        }

        .faq-item-button {
          border-radius: 15px;
        }

        .faq-item-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(42, 164, 201, 0.22);
        }

        .faq-chevron {
          transition: background-color 220ms ease;
        }

        .faq-chevron-icon {
          transition: transform 250ms ease, color 220ms ease;
        }

        @media (hover: hover) {
          .faq-item-closed:hover {
            background: #EAF5FC !important;
            border-color: rgba(42, 164, 201, 0.24) !important;
            transform: translateY(-1px);
          }

          .faq-item-closed:hover .faq-chevron {
            background: rgba(42, 164, 201, 0.12) !important;
          }

          .faq-item-closed:hover .faq-chevron-icon {
            color: #2AA4C9 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-item,
          .faq-panel,
          .faq-answer-inner,
          .faq-chevron-icon {
            transition-duration: 0.01ms !important;
          }

          .faq-item-closed:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
