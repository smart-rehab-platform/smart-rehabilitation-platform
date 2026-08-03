import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

export function ParentEncouragement({ message }) {
  return (
    <aside className="pd-encouragement pd-section-enter" aria-label="Encouragement">
      <span className="pd-encouragement-icon" aria-hidden="true">
        <PlatformMaterialIcon icon="ai" size={16} />
      </span>
      <p>{message}</p>
    </aside>
  );
}
