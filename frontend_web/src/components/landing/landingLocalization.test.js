import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTranslator } from "../../i18n/index.js";
import {
  buildLandingFaqItems,
  buildLandingFeatureIndicators,
  buildLandingFooterAccessLinks,
  buildLandingFooterPlatformLinks,
  buildLandingNavLinks,
  getAuthHeroHeadlineAr,
  getLandingGetStartedLabel,
  getLandingSignInLabel,
  LANDING_NAV_LINKS,
  LANDING_SCROLL_SPY_HREFS,
  LANDING_SECTION_IDS,
} from "./landingLocalization.js";

describe("landingLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("translates landing navbar labels EN/AR", () => {
    const enLinks = buildLandingNavLinks(translateEn);
    const arLinks = buildLandingNavLinks(translateAr);

    assert.equal(enLinks.length, LANDING_NAV_LINKS.length);
    assert.equal(enLinks[0].label, "Home");
    assert.equal(arLinks[0].label, "الرئيسية");
    assert.equal(getLandingSignInLabel(translateEn), "Sign In");
    assert.equal(getLandingSignInLabel(translateAr), "تسجيل الدخول");
    assert.equal(getLandingGetStartedLabel(translateEn), "Get Started");
    assert.equal(getLandingGetStartedLabel(translateAr), "ابدأ الآن");
  });

  it("translates hero headline and feature labels", () => {
    assert.equal(translateEn("landing.hero.headline.line1"), "Smarter Rehabilitation.");
    assert.equal(translateAr("landing.hero.headline.line1"), "تأهيلٌ أذكى.");

    const enFeatures = buildLandingFeatureIndicators(translateEn);
    const arFeatures = buildLandingFeatureIndicators(translateAr);

    assert.equal(enFeatures[0].label, "AI-Powered Insights");
    assert.equal(arFeatures[0].label, "رؤى مدعومة بالذكاء الاصطناعي");
    assert.equal(enFeatures[1].label, "3 Connected Roles");
    assert.match(arFeatures[1].label, /3/);
  });

  it("translates hero CTA labels", () => {
    assert.equal(translateEn("landing.hero.getStarted"), "Get Started");
    assert.equal(translateAr("landing.hero.getStarted"), "ابدأ الآن");
    assert.equal(translateEn("landing.hero.explorePlatform"), "Explore the Platform");
    assert.equal(translateAr("landing.hero.explorePlatform"), "استكشف المنصة");
  });

  it("includes FAQ copy in both locales", () => {
    const enFaq = buildLandingFaqItems(translateEn);
    const arFaq = buildLandingFaqItems(translateAr);

    assert.equal(enFaq.length, 10);
    assert.equal(arFaq.length, 10);
    assert.equal(enFaq[0].question, "Who can use the platform?");
    assert.match(arFaq[0].question, /المنصة/);
    assert.equal(enFaq[0].answer.length > 0, true);
    assert.equal(arFaq[0].answer.length > 0, true);
  });

  it("translates footer labels", () => {
    const enPlatform = buildLandingFooterPlatformLinks(translateEn);
    const arPlatform = buildLandingFooterPlatformLinks(translateAr);
    const enAccess = buildLandingFooterAccessLinks(translateEn);
    const arAccess = buildLandingFooterAccessLinks(translateAr);

    assert.equal(enPlatform[0].label, "Features");
    assert.equal(arPlatform[0].label, "الميزات");
    assert.equal(enAccess[1].label, "Create Account");
    assert.match(arAccess[1].label, /حساب/);
    assert.match(translateAr("landing.footer.copyright"), /Smart Rehabilitation Platform/);
  });

  it("keeps auth hero Arabic headline exact", () => {
    assert.equal(getAuthHeroHeadlineAr(translateAr), "نُمكّن كل رحلة إعادة التأهيل");
  });

  it("falls back to English when translator is unavailable", () => {
    assert.equal(getLandingSignInLabel(null), "Sign In");
    assert.equal(buildLandingNavLinks(null)[0].label, "landing.nav.home");
  });

  it("preserves landing route and section IDs", () => {
    assert.deepEqual(
      LANDING_SCROLL_SPY_HREFS.map((href) => href.replace("#", "")),
      LANDING_SECTION_IDS,
    );
    assert.equal(LANDING_NAV_LINKS.some((link) => link.href === "#features"), true);
    assert.equal(LANDING_NAV_LINKS.some((link) => link.href === "#how-it-works"), true);
  });
});
