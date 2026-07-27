import { CalendarPlus, MessageSquare } from "lucide-react";

const ACTIONS = [
  { id: "request-session", label: "Request Session", icon: CalendarPlus },
  { id: "message", label: "Message Specialist", icon: MessageSquare },
];

export function QuickActionsCompact({ onAction }) {
  return (
    <section className="pd-quick-compact" aria-label="Quick actions">
      <p className="pd-eyebrow">Quick Actions</p>
      <div className="pd-quick-compact-row">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className="pd-btn pd-btn-outline pd-btn-sm pd-quick-compact-btn"
              onClick={() => onAction?.(action.label)}
            >
              <Icon size={14} aria-hidden="true" />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
