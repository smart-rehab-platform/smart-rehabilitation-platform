import { useLocale } from "../../../context/useLocale.js";

export function SpecialistGreeting({ firstName }) {
  const { t } = useLocale();

  return (
    <section className="pd-greeting pd-section-enter" aria-label={t("specialist.dashboard.greetingAriaLabel")}>
      <div className="pd-greeting-main">
        <h1>{t("specialist.dashboard.greeting", { name: firstName })}</h1>
        <p>{t("specialist.dashboard.greetingSubtitle")}</p>
      </div>
    </section>
  );
}
