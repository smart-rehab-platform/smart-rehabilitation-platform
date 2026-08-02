import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { LandingHeroBackground } from "../components/landing/LandingHeroBackground";
import { ArtificialIntelligenceSection } from "../components/landing/ArtificialIntelligenceSection";
import { HeroCards } from "../components/landing/HeroCards";
import { JourneySection } from "../components/landing/JourneySection";
import { PlatformModulesSection } from "../components/landing/PlatformModulesSection";
import { ProblemSolutionSection } from "../components/landing/ProblemSolutionSection";
import { WaveDivider } from "../components/landing/WaveDivider";
import { ValueStrip } from "../components/landing/ValueStrip";
import { WhyChooseUsSection } from "../components/landing/WhyChooseUsSection";
import { FaqSection } from "../components/landing/FaqSection";
import { FinalCtaSection } from "../components/landing/FinalCtaSection";
import { LandingFooter } from "../components/landing/LandingFooter";
import { L } from "../components/landing/landingTokens";

export default function LandingPage() {
  return (
    <div
      className="landing-page min-h-screen"
      style={{ background: L.bg, color: L.text }}
    >
      <main>
        <div className="landing-hero-shell relative overflow-hidden">
          <LandingHeroBackground />
          <div className="relative z-10">
            <Navbar />
            <Hero />
            <WaveDivider />
          </div>
        </div>
        <ValueStrip />
        <ProblemSolutionSection />
        <section
          id="who-its-for"
          className="overflow-hidden px-5 pb-16 md:pb-24 lg:px-8 pt-10 md:pt-14"
          style={{ background: L.lightBg }}
        >
          <HeroCards />
        </section>
        <JourneySection />
        <PlatformModulesSection />
        <ArtificialIntelligenceSection />
        <WhyChooseUsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
