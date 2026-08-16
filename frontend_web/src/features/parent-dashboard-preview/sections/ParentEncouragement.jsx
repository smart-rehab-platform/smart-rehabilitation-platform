import { useLocale } from "../../../context/useLocale.js";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

export function ParentEncouragement({ message }) {
  const { t } = useLocale();

  return (
    <aside className="pd-encouragement pd-section-enter" aria-label={t("parent.home.encouragementAriaLabel")}>
      <span className="pd-encouragement-icon" aria-hidden="true">
        <PlatformMaterialIcon icon="ai" size={16} />
      </span>
      <p dir="auto">{message}</p>
    </aside>
  );
}
