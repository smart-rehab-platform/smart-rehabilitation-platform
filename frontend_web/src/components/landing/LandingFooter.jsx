import { Link } from "react-router-dom";
import { LandingLogo } from "./LandingLogo";
import { L } from "./landingTokens";

const PLATFORM_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "AI Solutions", href: "#ai-solutions" },
  { label: "Who It's For", href: "#who-its-for" },
  { label: "About", href: "#about" },
  { label: "Join Us", href: "#join-us" },
];

const ACCESS_LINKS = [
  { label: "Sign In", href: "/login", isRoute: true },
  { label: "Create Account", href: "/signup", isRoute: true },
];

function scrollToSection(href) {
  const id = href.replace("#", "");
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function FooterLinkColumn({ title, links }) {
  return (
    <div>
      <h3
        className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.isRoute ? (
              <Link
                to={link.href}
                className="text-[14px] transition-colors duration-200 hover:text-white"
                style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-[14px] transition-colors duration-200 hover:text-white"
                style={{ color: L.textLight, fontFamily: "'Inter', sans-serif" }}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: L.border,
        background: L.bg,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <LandingLogo showTagline={false} />
            <p
              className="mt-4 max-w-sm text-[14px] leading-relaxed"
              style={{ color: L.textLight }}
            >
              A connected rehabilitation platform that brings together families, specialists,
              administrators, and AI-powered clinical tools to support better rehabilitation
              outcomes.
            </p>
          </div>

          <FooterLinkColumn title="Platform" links={PLATFORM_LINKS} />
          <FooterLinkColumn title="Access" links={ACCESS_LINKS} />
        </div>

        <div
          className="mt-10 border-t pt-6 text-center text-[12px] leading-relaxed md:text-[13px]"
          style={{ borderColor: L.border, color: L.textLight }}
        >
          © 2026 Smart Rehabilitation Platform.
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Graduation Project — All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
