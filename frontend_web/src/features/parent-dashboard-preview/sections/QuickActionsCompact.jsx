import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

const ACTIONS = [
  { id: "request-session", label: "Request Session", icon: "request-session" },
  { id: "message", label: "Message Specialist", icon: "message" },
];

export function QuickActionsCompact({ onAction }) {
  return (
    <section className="pd-quick-compact" aria-label="Quick actions">
      <p className="pd-eyebrow">Quick Actions</p>
      <div className="pd-quick-compact-row">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="pd-btn pd-btn-outline pd-btn-sm pd-quick-compact-btn"
            onClick={() => onAction?.(action.label)}
          >
            <PlatformMaterialIcon icon={action.icon} size={14} />
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
