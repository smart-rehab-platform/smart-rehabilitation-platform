import { CheckCircle2 } from "lucide-react";
import accountTreeIcon from "../../assets/icons/account_tree.svg";
import homeHealthIcon from "../../assets/icons/home_health.svg";
import monitoringIcon from "../../assets/icons/monitoring.svg";
import { L } from "./landingTokens";

const CHALLENGES = [
  {
    label: "Challenge A",
    title: "Fragmented Follow-Up",
    description:
      "Communication, reports, and progress updates are often spread across different tools.",
    icon: accountTreeIcon,
  },
  {
    label: "Challenge B",
    title: "Limited Home Guidance",
    description:
      "Families do not always receive clear and continuous support for daily rehabilitation activities.",
    icon: homeHealthIcon,
  },
  {
    label: "Challenge C",
    title: "Delayed Progress Insight",
    description:
      "Specialists may not have enough visibility into the patient's performance between sessions.",
    icon: monitoringIcon,
  },
];

function ChallengeMaterialIcon({ src }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="h-[30px] w-[30px] object-contain"
    />
  );
}

function ChallengeCard({ label, title, description, icon }) {
  return (
    <article
      className="flex h-full flex-col rounded-2xl border p-6"
      style={{
        background: L.lightBg,
        borderColor: L.lightBorder,
        boxShadow: L.challengeCardShadow,
      }}
    >
      <div className="mb-4">
        <ChallengeMaterialIcon src={icon} />
      </div>

      <span
        className="mb-[18px] inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold"
        style={{
          background: L.challengeBadgeBg,
          color: L.challengeBadgeText,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </span>

      <h3
        className="mb-2 text-[16px] font-semibold leading-snug"
        style={{ color: L.challengeTitle, fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </h3>

      <p
        className="text-[14px] leading-relaxed"
        style={{ color: L.challengeBody, fontFamily: "'Inter', sans-serif" }}
      >
        {description}
      </p>
    </article>
  );
}

export function ProblemSolutionSection() {
  return (
    <section
      className="overflow-hidden px-5 py-16 md:py-20 lg:px-8 lg:py-24"
      style={{ background: L.sectionSoftBg }}
      aria-labelledby="problem-solution-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12 lg:mb-14">
          <h2
            id="problem-solution-heading"
            className="text-[2.125rem] leading-[1.15] tracking-tight sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
            style={{ color: L.sectionHeading, fontFamily: "'Playfair Display', serif" }}
          >
            Rehabilitation Should Not Stop
            <br />
            After the Session
          </h2>

          <p
            className="mx-auto mt-5 max-w-[720px] text-[16px] leading-relaxed md:mt-6 md:text-[17px] lg:text-[18px]"
            style={{ color: L.sectionBody, fontFamily: "'Inter', sans-serif" }}
          >
            Families often struggle to follow treatment plans at home, specialists lack continuous
            visibility into daily performance, and progress information becomes scattered across
            calls, messages, appointments, and reports.
          </p>
        </header>

        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mb-6 lg:grid-cols-3">
          {CHALLENGES.map((challenge) => (
            <ChallengeCard key={challenge.label} {...challenge} />
          ))}
        </div>

        <div
          className="flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:gap-5 md:p-7 lg:p-8"
          style={{
            background: L.solutionBannerBg,
            boxShadow: L.challengeCardShadow,
          }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: L.solutionIconBg }}
          >
            <CheckCircle2
              size={22}
              strokeWidth={2}
              style={{ color: L.solutionIconColor }}
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p
              className="mb-1.5 text-[10px] font-semibold tracking-[0.16em]"
              style={{ color: L.solutionLabel, fontFamily: "'Inter', sans-serif" }}
            >
              THE SOLUTION
            </p>
            <p
              className="text-[17px] font-semibold leading-snug md:text-[18px] lg:text-[20px]"
              style={{ color: L.text, fontFamily: "'Inter', sans-serif" }}
            >
              Smart Rehabilitation brings the complete care journey into one connected platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
