import { Link } from "react-router-dom";
import { LandingHeroBackground } from "../components/landing/LandingHeroBackground";
import { LandingLogo } from "../components/landing/LandingLogo";
import { L } from "../components/landing/landingTokens";

const CONTACT_EMAIL = "smartrehab.ps@gmail.com";

const sections = [
  {
    title: "1. Introduction",
    body: [
      "Smart Rehab Platform (“Smart Rehab”, “we”, “us”, or “our”) provides digital rehabilitation tools for specialists, parents/caregivers, and administrators. This Privacy Policy explains how we collect, use, store, and protect personal information when you create an account or use our web or mobile applications.",
      "By creating an account or using Smart Rehab, you acknowledge this Privacy Policy. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "2. Account and personal data we collect",
    body: [
      "When you register or use Smart Rehab, we may collect information such as your full name, email address, phone number, account role (for example parent, specialist, or admin), profile details you choose to provide, and authentication-related records needed to secure your account.",
      "Depending on how you use the platform, we may also process operational data related to rehabilitation workflows (such as patient/case information you enter, session scheduling, exercise assignments, progress records, messages, and support requests). We process this information to provide the service you request and to support clinical and caregiving workflows within the platform.",
    ],
  },
  {
    title: "3. Email verification and password reset",
    body: [
      "We use your email address to verify new accounts and to help you reset your password when requested. Verification and password-reset messages contain secure, time-limited links. These emails are sent only for account security and account recovery purposes.",
      "We do not use verification or password-reset flows to send marketing messages.",
    ],
  },
  {
    title: "4. Gmail API / email delivery usage",
    body: [
      "Smart Rehab may use Google’s Gmail API (or equivalent Google email delivery capabilities associated with our service account) solely to send account-related emails on behalf of the platform—such as email verification and password-reset messages.",
      "We do not use the Gmail API to read, scan, store, or share the contents of users’ personal Gmail inboxes. Access is limited to sending transactional account emails required for authentication and account security.",
    ],
  },
  {
    title: "5. How we use your information",
    body: [
      "We use personal information to create and manage accounts, authenticate users, send essential service emails, operate rehabilitation features, communicate about account or service issues, improve reliability and security, and comply with legal obligations where applicable.",
    ],
  },
  {
    title: "6. Data protection and retention",
    body: [
      "We apply reasonable technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction. Access to account and clinical operational data is restricted according to user roles and platform permissions.",
      "We retain account and related service data for as long as needed to provide Smart Rehab, maintain security, meet legitimate operational needs, and satisfy legal or regulatory requirements. You may contact us to request account-related assistance regarding your data.",
    ],
  },
  {
    title: "7. Sharing of information",
    body: [
      "We do not sell personal information. We may share information with trusted service providers who help us operate the platform (for example hosting, email delivery, or infrastructure providers), only as needed to deliver the service, and subject to appropriate safeguards.",
      "We may also disclose information if required by law, regulation, or valid legal process, or to protect the rights, safety, and security of users and the platform.",
    ],
  },
  {
    title: "8. Your choices",
    body: [
      "You can update certain profile information within the application. You may request support related to verification emails, password resets, or account access by contacting us. Because some emails are required for account security, you cannot opt out of essential transactional messages while maintaining an active account that depends on email verification.",
    ],
  },
  {
    title: "9. Children’s privacy",
    body: [
      "Smart Rehab may be used by parents/caregivers and specialists in connection with pediatric rehabilitation workflows. Accounts are intended to be created and managed by adults. If you believe we have collected information inappropriately, please contact us so we can review and respond.",
    ],
  },
  {
    title: "10. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. The “Last updated” date at the top of this page will reflect the latest revision. Continued use of Smart Rehab after an update means you accept the revised policy.",
    ],
  },
  {
    title: "11. Contact",
    body: [
      `If you have questions about this Privacy Policy or how Smart Rehab handles personal data, contact us at ${CONTACT_EMAIL}.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: L.bg, color: L.text, fontFamily: "'Inter', sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-55">
        <LandingHeroBackground />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <LandingLogo showTagline={false} />
          <Link
            to="/"
            className="text-[14px] font-semibold transition-colors duration-200 hover:text-white"
            style={{ color: L.textLight }}
          >
            ← Back to home
          </Link>
        </header>

        <article
          className="rounded-3xl border p-6 shadow-lg sm:p-8 lg:p-10"
          style={{
            background: "rgba(23, 59, 94, 0.88)",
            borderColor: L.border,
            boxShadow: L.shadow,
          }}
        >
          <p
            className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: L.primaryLight }}
          >
            Legal
          </p>
          <h1
            className="text-[1.75rem] font-bold leading-tight sm:text-[2rem]"
            style={{ fontFamily: "'Syne', sans-serif", color: L.text }}
          >
            Privacy Policy
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: L.textMuted }}>
            Smart Rehab Platform
            <br />
            Last updated: August 25, 2026
          </p>

          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2
                  className="mb-2.5 text-[1.05rem] font-semibold leading-snug"
                  style={{ color: L.text }}
                >
                  {section.title}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mb-2.5 text-[14px] leading-relaxed last:mb-0"
                    style={{ color: L.textLight }}
                  >
                    {paragraph.includes(CONTACT_EMAIL) ? (
                      <>
                        {paragraph.split(CONTACT_EMAIL)[0]}
                        <a
                          href={`mailto:${CONTACT_EMAIL}`}
                          className="font-semibold underline-offset-2 hover:underline"
                          style={{ color: L.primaryLight }}
                        >
                          {CONTACT_EMAIL}
                        </a>
                        {paragraph.split(CONTACT_EMAIL)[1] || ""}
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>

        <p
          className="mt-8 pb-4 text-center text-[13px]"
          style={{ color: L.textMuted }}
        >
          © {new Date().getFullYear()} Smart Rehab Platform
        </p>
      </div>
    </div>
  );
}
