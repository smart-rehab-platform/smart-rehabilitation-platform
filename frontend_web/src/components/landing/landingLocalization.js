function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated) {
      return translated;
    }
  }

  return typeof fallback === "function" ? fallback(params) : fallback;
}

export const LANDING_NAV_LINKS = [
  { labelKey: "landing.nav.home", href: "#home" },
  { labelKey: "landing.nav.features", href: "#features" },
  { labelKey: "landing.nav.howItWorks", href: "#how-it-works" },
  { labelKey: "landing.nav.aiSolutions", href: "#ai-solutions" },
  { labelKey: "landing.nav.whoItsFor", href: "#who-its-for" },
  { labelKey: "landing.nav.about", href: "#about" },
  { labelKey: "landing.nav.faq", href: "#faq" },
  { labelKey: "landing.nav.joinUs", href: "#join-us" },
];

export const LANDING_SCROLL_SPY_HREFS = [
  "#home",
  "#who-its-for",
  "#how-it-works",
  "#features",
  "#ai-solutions",
  "#about",
  "#faq",
  "#join-us",
];

export function buildLandingNavLinks(t) {
  return LANDING_NAV_LINKS.map((link) => ({
    ...link,
    label: translateKey(t, link.labelKey, link.labelKey),
  }));
}

export function getLandingSignInLabel(t) {
  return translateKey(t, "landing.nav.signIn", "Sign In");
}

export function getLandingGetStartedLabel(t) {
  return translateKey(t, "landing.nav.getStarted", "Get Started");
}

export function buildLandingFeatureIndicators(t) {
  return [
    {
      key: "aiInsights",
      iconSrc: true,
      label: translateKey(t, "landing.features.aiInsights", "AI-Powered Insights"),
    },
    {
      key: "connectedRoles",
      icon: "users",
      label: translateKey(t, "landing.features.connectedRoles", "{count} Connected Roles", {
        count: 3,
      }),
    },
    {
      key: "continuousProgress",
      icon: "trendingUp",
      label: translateKey(t, "landing.features.continuousProgress", "Continuous Progress"),
    },
  ];
}

export function buildLandingValueItems(t) {
  return [
    {
      key: "families",
      icon: "users",
      title: translateKey(t, "landing.valueStrip.families.title", "Built for Families"),
      subtitle: translateKey(
        t,
        "landing.valueStrip.families.subtitle",
        "Supportive, clear, and accessible",
      ),
    },
    {
      key: "specialists",
      icon: "stethoscope",
      title: translateKey(t, "landing.valueStrip.specialists.title", "Designed for Specialists"),
      subtitle: translateKey(
        t,
        "landing.valueStrip.specialists.subtitle",
        "Clinical tools, full case visibility",
      ),
    },
    {
      key: "ai",
      icon: "brain",
      title: translateKey(t, "landing.valueStrip.ai.title", "Powered by AI"),
      subtitle: translateKey(
        t,
        "landing.valueStrip.ai.subtitle",
        "Smart summaries & recommendations",
      ),
    },
    {
      key: "progress",
      icon: "trendingUp",
      title: translateKey(t, "landing.valueStrip.progress.title", "Focused on Progress"),
      subtitle: translateKey(
        t,
        "landing.valueStrip.progress.subtitle",
        "Continuous, measurable improvement",
      ),
    },
  ];
}

export function buildLandingRoleCards(t) {
  return [
    {
      key: "family",
      eyebrow: translateKey(t, "landing.whoItsFor.family.eyebrow", "For Families"),
      title: translateKey(
        t,
        "landing.whoItsFor.family.title",
        "Everything Parents Need in One Place",
      ),
      description: translateKey(
        t,
        "landing.whoItsFor.family.description",
        "Track exercises, daily tasks, sessions, AI reports, notifications and communicate directly with specialists.",
      ),
      badges: [
        translateKey(t, "landing.whoItsFor.family.badges.exerciseTracking", "Exercise Tracking"),
        translateKey(t, "landing.whoItsFor.family.badges.aiReports", "AI Reports"),
        translateKey(t, "landing.whoItsFor.family.badges.parentDashboard", "Parent Dashboard"),
        translateKey(
          t,
          "landing.whoItsFor.family.badges.secureCommunication",
          "Secure Communication",
        ),
      ],
    },
    {
      key: "specialist",
      eyebrow: translateKey(t, "landing.whoItsFor.specialist.eyebrow", "For Specialists"),
      title: translateKey(
        t,
        "landing.whoItsFor.specialist.title",
        "Complete Rehabilitation Management",
      ),
      description: translateKey(
        t,
        "landing.whoItsFor.specialist.description",
        "Manage patients, assessments, treatment plans, exercises, reviews, reports and AI-powered rehabilitation tools.",
      ),
      badges: [
        translateKey(
          t,
          "landing.whoItsFor.specialist.badges.patientManagement",
          "Patient Management",
        ),
        translateKey(t, "landing.whoItsFor.specialist.badges.treatmentPlans", "Treatment Plans"),
        translateKey(t, "landing.whoItsFor.specialist.badges.speechAnalysis", "Speech Analysis"),
        translateKey(
          t,
          "landing.whoItsFor.specialist.badges.aiRecommendations",
          "AI Recommendations",
        ),
      ],
    },
    {
      key: "admin",
      eyebrow: translateKey(t, "landing.whoItsFor.admin.eyebrow", "For Administrators"),
      title: translateKey(t, "landing.whoItsFor.admin.title", "Complete Platform Oversight"),
      description: translateKey(
        t,
        "landing.whoItsFor.admin.description",
        "Manage users, specialists, patients, case requests, assignments, categories, and system-wide activity from one centralized workspace.",
      ),
      badges: [
        translateKey(t, "landing.whoItsFor.admin.badges.userManagement", "User Management"),
        translateKey(t, "landing.whoItsFor.admin.badges.caseRequests", "Case Requests"),
        translateKey(
          t,
          "landing.whoItsFor.admin.badges.specialistAssignments",
          "Specialist Assignments",
        ),
        translateKey(t, "landing.whoItsFor.admin.badges.systemAnalytics", "System Analytics"),
      ],
      centeredOnTablet: true,
    },
  ];
}

export function buildLandingChallenges(t) {
  return ["a", "b", "c"].map((key) => ({
    key,
    label: translateKey(t, `landing.problemSolution.challenges.${key}.label`, key),
    title: translateKey(t, `landing.problemSolution.challenges.${key}.title`, key),
    description: translateKey(t, `landing.problemSolution.challenges.${key}.description`, key),
  }));
}

const WORKFLOW_STEP_KEYS = [
  "submitCaseRequest",
  "specialistAssignment",
  "assessmentCommunication",
  "acceptCreatePatient",
  "treatmentPlan",
  "homeExercises",
  "specialistReview",
  "aiProgressTracking",
];

export function buildLandingWorkflowSteps(t) {
  return WORKFLOW_STEP_KEYS.map((key) => ({
    key,
    title: translateKey(t, `landing.journey.steps.${key}.title`, key),
    description: translateKey(t, `landing.journey.steps.${key}.description`, key),
  }));
}

export function buildLandingAiWidgets(t) {
  return [
    {
      key: "speechAnalysis",
      icon: "mic",
      label: translateKey(t, "landing.journey.preview.aiReport.widgets.speechAnalysis", "Speech Analysis"),
    },
    {
      key: "weeklySummary",
      icon: "activity",
      label: translateKey(t, "landing.journey.preview.aiReport.widgets.weeklySummary", "Weekly Summary"),
    },
    {
      key: "progressScore",
      icon: "trendingUp",
      label: translateKey(t, "landing.journey.preview.aiReport.widgets.progressScore", "Progress Score"),
    },
    {
      key: "aiRecommendation",
      iconSrc: true,
      label: translateKey(
        t,
        "landing.journey.preview.aiReport.widgets.aiRecommendation",
        "AI Recommendation",
      ),
    },
  ];
}

const MODULE_DEFINITIONS = [
  {
    key: "caseManagement",
    featureKeys: ["intake", "assignment", "assessment", "conversion", "linking"],
  },
  {
    key: "treatmentManagement",
    featureKeys: ["assessments", "treatmentPlans", "shortTermGoals", "longTermGoals", "goalProgress"],
  },
  {
    key: "homeExerciseSupport",
    featureKeys: ["tasks", "instructions", "submissions", "notes", "retry"],
  },
  {
    key: "specialistReview",
    featureKeys: ["review", "rating", "feedback", "approveRetry", "history"],
  },
  {
    key: "sessions",
    featureKeys: ["upcoming", "onlineLinks", "requests", "approval", "statuses"],
  },
  {
    key: "communication",
    featureKeys: ["chat", "presence", "attachments", "readStatus", "notifications"],
  },
  {
    key: "progressReports",
    featureKeys: ["periods", "goalCompletion", "improvement", "specialistReports", "pdfExports"],
  },
];

export function buildLandingModules(t) {
  return MODULE_DEFINITIONS.map(({ key, featureKeys }) => ({
    key,
    title: translateKey(t, `landing.modules.items.${key}.title`, key),
    description: translateKey(t, `landing.modules.items.${key}.description`, key),
    features: featureKeys.map((featureKey) =>
      translateKey(t, `landing.modules.items.${key}.features.${featureKey}`, featureKey),
    ),
  }));
}

const COMPARISON_KEYS = [
  "communication",
  "progress",
  "homeGuidance",
  "feedback",
  "summaries",
  "tools",
];

export function buildLandingComparisons(t) {
  return COMPARISON_KEYS.map((key) => ({
    key,
    traditional: translateKey(
      t,
      `landing.whyChooseUs.comparisons.${key}.traditional`,
      key,
    ),
    smart: translateKey(t, `landing.whyChooseUs.comparisons.${key}.smart`, key),
  }));
}

const FAQ_KEYS = [
  "whoCanUse",
  "childJoin",
  "familyCommunication",
  "homeExercises",
  "onlineSessions",
  "progressMonitoring",
  "aiUsage",
  "security",
  "mobileWeb",
  "anywhere",
];

export function buildLandingFaqItems(t) {
  return FAQ_KEYS.map((key) => ({
    key,
    question: translateKey(t, `landing.faq.items.${key}.question`, key),
    answer: translateKey(t, `landing.faq.items.${key}.answer`, key),
  }));
}

export function buildLandingFinalCtaBenefits(t) {
  return [
    translateKey(t, "landing.finalCta.benefits.quickStart", "Get Started in Minutes"),
    translateKey(t, "landing.finalCta.benefits.aiAssisted", "AI-Assisted Rehabilitation"),
    translateKey(t, "landing.finalCta.benefits.mobileWeb", "Mobile & Web Access"),
    translateKey(t, "landing.finalCta.benefits.secure", "Secure Role-Based Platform"),
  ];
}

export function buildLandingFooterPlatformLinks(t) {
  return [
    { label: translateKey(t, "landing.footer.platform.features", "Features"), href: "#features" },
    {
      label: translateKey(t, "landing.footer.platform.howItWorks", "How It Works"),
      href: "#how-it-works",
    },
    {
      label: translateKey(t, "landing.footer.platform.aiSolutions", "AI Solutions"),
      href: "#ai-solutions",
    },
    {
      label: translateKey(t, "landing.footer.platform.whoItsFor", "Who It's For"),
      href: "#who-its-for",
    },
    { label: translateKey(t, "landing.footer.platform.about", "About"), href: "#about" },
    { label: translateKey(t, "landing.footer.platform.joinUs", "Join Us"), href: "#join-us" },
  ];
}

export function buildLandingFooterAccessLinks(t) {
  return [
    {
      label: translateKey(t, "landing.footer.access.signIn", "Sign In"),
      href: "/login",
      isRoute: true,
    },
    {
      label: translateKey(t, "landing.footer.access.createAccount", "Create Account"),
      href: "/signup",
      isRoute: true,
    },
  ];
}

export function getAuthHeroHeadlineAr(t) {
  const line1 = translateKey(t, "auth.hero.leadLine1", "");
  const highlight = translateKey(t, "auth.hero.leadHighlight", "");
  const line2 = translateKey(t, "auth.hero.leadLine2", "");
  return `${line1} ${highlight}${line2 ? ` ${line2}` : ""}`.replace(/\s+/g, " ").trim();
}

export const LANDING_SECTION_IDS = [
  "home",
  "who-its-for",
  "how-it-works",
  "features",
  "ai-solutions",
  "about",
  "faq",
  "join-us",
];

export function getCarouselTrackOffset({ activeIndex, cardWidth, gap = 24 }) {
  const stride = cardWidth + gap;
  return activeIndex * stride + cardWidth / 2;
}

export function getCarouselVisualControls(isRtl) {
  if (!isRtl) {
    return {
      left: { delta: -1, ariaKey: "landing.modules.carousel.previous" },
      right: { delta: 1, ariaKey: "landing.modules.carousel.next" },
    };
  }

  return {
    left: { delta: -1, ariaKey: "landing.modules.carousel.previous" },
    right: { delta: 1, ariaKey: "landing.modules.carousel.next" },
  };
}

export function isCarouselControlDisabled(activeIndex, lastIndex, side, isRtl) {
  if (!isRtl) {
    return side === "left" ? activeIndex === 0 : activeIndex === lastIndex;
  }

  return side === "left" ? activeIndex === 0 : activeIndex === lastIndex;
}

export function getCarouselSwipeAction(offset, threshold) {
  if (offset > threshold) {
    return "prev";
  }
  if (offset < -threshold) {
    return "next";
  }
  return null;
}

export function getCarouselTrackOffsetsForRange({ cardWidth, cardCount, gap = 24 }) {
  return Array.from({ length: cardCount }, (_, activeIndex) =>
    getCarouselTrackOffset({ activeIndex, cardWidth, gap }),
  );
}
