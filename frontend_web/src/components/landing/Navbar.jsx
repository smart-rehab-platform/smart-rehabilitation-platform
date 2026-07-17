import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LandingLogo } from "./LandingLogo";
import { L, NAV_LINKS } from "./landingTokens";

function scrollToSection(href) {
  const id = href.replace("#", "");
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (event, href) => {
    event.preventDefault();
    scrollToSection(href);
    setMobileOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: L.navBg,
        borderColor: L.border,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <a href="#home" onClick={(event) => handleNavClick(event, "#home")} className="no-underline">
          <LandingLogo />
        </a>

        <nav className="hidden xl:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className="text-[13px] font-medium transition-colors duration-200"
              style={{
                color: link.href === "#home" ? L.primary : L.textMuted,
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = L.primaryLight;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color =
                  link.href === "#home" ? L.primary : L.textMuted;
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="text-[13px] font-medium px-3 py-2 rounded-lg transition-colors duration-200"
            style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = L.primaryLight;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = L.textMuted;
            }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-[13px] font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200"
            style={{
              background: L.gradientButton,
              fontFamily: "'Inter', sans-serif",
              boxShadow: `0 4px 20px ${L.hoverGlow}`,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.boxShadow = `0 6px 28px ${L.hoverGlow}`;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.boxShadow = `0 4px 20px ${L.hoverGlow}`;
            }}
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg"
          style={{ color: L.text }}
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t px-5 py-4 space-y-1 backdrop-blur-md"
          style={{ borderColor: L.border, background: L.navBg }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className="block py-2.5 text-sm font-medium"
              style={{ color: L.textMuted, fontFamily: "'Inter', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              to="/login"
              className="text-center text-sm font-medium py-2.5 rounded-xl border"
              style={{ color: L.textMuted, borderColor: L.border }}
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-center text-sm font-semibold py-2.5 rounded-xl text-white"
              style={{
                background: L.gradientButton,
                boxShadow: `0 4px 20px ${L.hoverGlow}`,
              }}
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
