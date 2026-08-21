import { ExternalLink, MapPin } from "lucide-react";
import { extractMeetingUrl } from "../../parent-dashboard-preview/utils/parentDashboardMappers.js";

export function AdminSessionLocationCell({ value, emptyDisplay }) {
  const trimmed = value && String(value).trim();

  if (!trimmed) {
    return (
      <span className="pd-admin-sessions-location is-empty">
        {emptyDisplay}
      </span>
    );
  }

  const isUrl = Boolean(extractMeetingUrl(trimmed));
  const Icon = isUrl ? ExternalLink : MapPin;

  return (
    <span className={`pd-admin-sessions-location${isUrl ? " is-url" : ""}`} title={trimmed} dir={isUrl ? "ltr" : "auto"}>
      <Icon size={14} className="pd-admin-sessions-location-icon" aria-hidden="true" />
      <span className="pd-admin-sessions-location-text">{trimmed}</span>
    </span>
  );
}
