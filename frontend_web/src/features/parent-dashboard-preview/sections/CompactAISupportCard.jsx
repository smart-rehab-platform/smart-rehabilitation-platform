import { Sparkles } from "lucide-react";

export function CompactAISupportCard({ aiSupport, onOpen }) {
  return (
    <section className="pd-ai-support">
      <div className="pd-ai-copy">
        <span className="pd-ai-icon" aria-hidden="true">
          <Sparkles size={16} />
        </span>
        <div>
          <strong>{aiSupport.title}</strong>
          <p>{aiSupport.body}</p>
          <small>AI suggestions are for guidance only and do not replace specialist care.</small>
        </div>
      </div>
      <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={onOpen}>
        {aiSupport.cta}
      </button>
    </section>
  );
}
