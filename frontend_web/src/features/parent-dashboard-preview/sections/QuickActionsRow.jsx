import { CalendarPlus, MessageSquarePlus, PlusCircle, Sparkles } from "lucide-react";

const ICONS = {
  "request-session": CalendarPlus,
  message: MessageSquarePlus,
  case: PlusCircle,
  ai: Sparkles,
};

export function QuickActionsRow({ actions, onAction }) {
  return (
    <section className="pd-quick-actions" aria-label="Quick actions">
      <h2 className="pd-eyebrow">Quick Actions</h2>
      <div className="pd-quick-grid">
        {actions.map((action) => {
          const Icon = ICONS[action.id] || Sparkles;
          return (
            <button
              key={action.id}
              type="button"
              className={`pd-quick-card pd-tone-${action.tone}`}
              onClick={() => onAction(action.label)}
            >
              <span className="pd-quick-icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
