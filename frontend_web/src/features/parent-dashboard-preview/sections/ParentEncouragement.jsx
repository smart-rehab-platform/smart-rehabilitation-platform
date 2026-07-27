import { Sparkles } from "lucide-react";

export function ParentEncouragement({ message }) {
  return (
    <aside className="pd-encouragement pd-section-enter" aria-label="Encouragement">
      <span className="pd-encouragement-icon" aria-hidden="true">
        <Sparkles size={16} />
      </span>
      <p>{message}</p>
    </aside>
  );
}
