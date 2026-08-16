import { useLocale } from "../../../context/useLocale.js";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { StatusBadge } from "../components/StatusBadge";

export function ActiveCaseBanner({ caseRequest, onView }) {
  const { t } = useLocale();

  if (!caseRequest) return null;

  const firstName = caseRequest.childFirstName
    || caseRequest.childName?.split(" ")[0]
    || t("parent.home.activeCaseBanner.yourChild");

  return (
    <section className="pd-case-banner" aria-label={t("parent.home.activeCaseBanner.ariaLabel")}>
      <span className="pd-case-banner-icon" aria-hidden="true">
        <PlatformMaterialIcon icon="caseRequests" size={16} />
      </span>

      <div className="pd-case-banner-copy">
        <p>
          {t("parent.home.activeCaseBanner.message", {
            name: firstName,
            specialist: caseRequest.specialistName,
          })}
        </p>
      </div>

      <div className="pd-case-banner-meta">
        <span className="pd-other-child">{caseRequest.anotherChildLabel}</span>
        <StatusBadge label={caseRequest.status} tone="warning" />
        <button type="button" className="pd-link" onClick={onView}>
          {t("parent.home.activeCaseBanner.viewRequest")} →
        </button>
      </div>
    </section>
  );
}
