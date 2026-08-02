import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

const ACTION_ICON_KEYS = {
  "request-session": "request-session",
  message: "message",
  case: "case",
  ai: "ai",
};

export function QuickActionsRow({ actions, onAction }) {
  return (
    <section className="pd-quick-actions" aria-label="Quick actions">
      <h2 className="pd-eyebrow">Quick Actions</h2>
      <div className="pd-quick-grid">
        {actions.map((action) => {
          const iconKey = ACTION_ICON_KEYS[action.id] || "ai";

          return (
            <button
              key={action.id}
              type="button"
              className={`pd-quick-card pd-tone-${action.tone}`}
              onClick={() => onAction(action.label)}
            >
              <span className="pd-quick-icon" aria-hidden="true">
                <PlatformMaterialIcon icon={iconKey} size={18} />
              </span>
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}