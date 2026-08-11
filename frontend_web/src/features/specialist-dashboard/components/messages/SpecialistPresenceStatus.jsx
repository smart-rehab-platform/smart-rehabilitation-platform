import { formatPresenceLabel } from "../../hooks/useSpecialistPresence";

export function SpecialistPresenceStatus({ presence, isOnline, label, isLoading = false }) {
  const displayLabel = label || formatPresenceLabel(presence);

  return (
    <span className={`pd-specialist-presence${isOnline ? " is-online" : ""}`}>
      <span className="pd-specialist-presence-dot" aria-hidden="true" />
      <span>{isLoading ? "Checking status..." : displayLabel}</span>
    </span>
  );
}
