import { useEffect, useState } from "react";

const NAVBAR_OFFSET = 88;
const ACTIVATION_BUFFER = 32;

function getSectionTop(element) {
  return element.getBoundingClientRect().top + window.scrollY;
}

export function useScrollSpy(sectionHrefs) {
  const [activeHref, setActiveHref] = useState(sectionHrefs[0] ?? "#home");

  useEffect(() => {
    if (!sectionHrefs.length) return;

    const updateActiveSection = () => {
      const activationLine = window.scrollY + NAVBAR_OFFSET + ACTIVATION_BUFFER;

      const sections = sectionHrefs
        .map((href) => {
          const element = document.getElementById(href.replace("#", ""));
          if (!element) return null;
          return { href, top: getSectionTop(element) };
        })
        .filter(Boolean)
        .sort((a, b) => a.top - b.top);

      if (!sections.length) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

      if (nearBottom) {
        setActiveHref(sections[sections.length - 1].href);
        return;
      }

      let currentHref = sections[0].href;
      for (const section of sections) {
        if (section.top <= activationLine) {
          currentHref = section.href;
        }
      }

      setActiveHref(currentHref);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sectionHrefs]);

  return activeHref;
}
