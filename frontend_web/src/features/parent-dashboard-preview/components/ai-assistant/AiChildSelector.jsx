import { ChildSelector } from "../ChildSelector";

export function AiChildSelector({
  children,
  selectedChildId,
  isLoading,
  onSelect,
}) {
  return (
    <div className="pd-ai-child-selector">
      <span className="pd-ai-field-label">Child</span>
      <ChildSelector
        items={children}
        selectedChildId={selectedChildId}
        isLoading={isLoading}
        onSelect={onSelect}
      />
    </div>
  );
}
