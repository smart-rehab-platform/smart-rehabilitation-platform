import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminDashboardHomeLabels } from "../utils/adminDashboardLocalization.js";

export function AdminGreeting({ name }) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminDashboardHomeLabels(t), [t]);

  return (
    <section className="pd-greeting pd-admin-greeting pd-section-enter" aria-label={labels.greetingAriaLabel}>
      <div className="pd-greeting-main">
        <h1>{t("admin.dashboard.welcome", { name })}</h1>
        <p>{labels.subtitle}</p>
      </div>
    </section>
  );
}
