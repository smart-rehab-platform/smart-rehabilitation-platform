import { useLocale } from "../../../../context/useLocale.js";
import { ChildSelector } from "../ChildSelector";

export function AiChildSelector({
  children,
  selectedChildId,
  isLoading,
  onSelect,
}) {
  const { t } = useLocale();

  return (
    <div className="pd-ai-child-selector">
      <span className="pd-ai-field-label">{t("parent.aiAssistant.childLabel")}</span>
      <ChildSelector
        items={children}
        selectedChildId={selectedChildId}
        isLoading={isLoading}
        onSelect={onSelect}
      />
    </div>
  );
}
