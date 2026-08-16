import { useLocale } from "../../../../context/useLocale.js";

export function ParentProfileErrorState({ message, onRetry }) {
  const { t } = useLocale();

  return (
    <section className="pd-card pd-card-pad pd-profile-state pd-section-enter" role="alert">
      <p className="pd-inline-error">{message}</p>
      {onRetry ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          {t("parent.common.retry")}
        </button>
      ) : null}
    </section>
  );
}
