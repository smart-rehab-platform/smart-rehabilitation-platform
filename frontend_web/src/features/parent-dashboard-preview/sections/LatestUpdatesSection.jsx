import { ArrowRight } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

function buildUpdates({ latestReport, recentFeedback }) {
  const items = [];

  if (latestReport) {
    items.push({
      id: "latest-report",
      type: "report",
      title: latestReport.title || "Weekly Progress Report",
      description: latestReport.preview || null,
      timestamp: latestReport.date || null,
      actionLabel: "Open Report",
    });
  }

  if (recentFeedback) {
    items.push({
      id: "latest-feedback",
      type: "feedback",
      title: "Latest Specialist Feedback",
      description: recentFeedback.quote || null,
      timestamp: [recentFeedback.specialistName, recentFeedback.date].filter(Boolean).join(" · "),
      actionLabel: "View Feedback",
    });
  }

  return items;
}

function UpdateIcon({ type }) {
  if (type === "report") {
    return <PlatformMaterialIcon icon="report" size={15} />;
  }
  return <PlatformMaterialIcon icon="message" size={15} />;
}

function toneForType(type) {
  return type === "report" ? "purple" : "blue";
}

export function LatestUpdatesSection({
  latestReport,
  recentFeedback,
  onItemAction,
  onViewAll,
}) {
  const updates = buildUpdates({ latestReport, recentFeedback });

  if (updates.length === 0) {
    return null;
  }

  return (
    <section className="pd-card pd-card-pad pd-latest-updates pd-section-enter" aria-label="Latest updates">
      <div className="pd-card-header">
        <h2 className="pd-section-title">Latest Updates</h2>
        <button type="button" className="pd-link" onClick={onViewAll}>
          See All
        </button>
      </div>

      <ul className="pd-latest-updates-feed">
        {updates.map((item, index) => (
          <li key={item.id} className="pd-latest-update-feed-item">
            <span className="pd-latest-update-feed-marker" aria-hidden="true">
              <i className="pd-latest-update-feed-dot" />
              {index < updates.length - 1 ? <i className="pd-latest-update-feed-line" /> : null}
            </span>
            <button
              type="button"
              className="pd-latest-update-row"
              onClick={() => onItemAction?.(item)}
            >
              <span className={`pd-latest-update-icon pd-tone-${toneForType(item.type)}`} aria-hidden="true">
                <UpdateIcon type={item.type} />
              </span>
              <span className="pd-latest-update-copy">
                <strong>{item.title}</strong>
                {item.description ? (
                  <p className="pd-latest-update-preview">{item.description}</p>
                ) : null}
                {item.timestamp ? (
                  <small className="pd-latest-update-time">{item.timestamp}</small>
                ) : null}
              </span>
              <span className="pd-latest-update-action">
                {item.actionLabel}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
