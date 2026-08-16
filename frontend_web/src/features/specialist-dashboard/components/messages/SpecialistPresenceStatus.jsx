import { useMemo } from "react";
import { useLocale } from "../../../../context/useLocale.js";
import { formatPresenceLabel } from "../../hooks/useSpecialistPresence";

export function SpecialistPresenceStatus({ presence, isOnline, label, isLoading = false }) {
  const { t, locale } = useLocale();
  const checkingLabel = useMemo(
    () => t("specialist.messages.presence.checkingStatus"),
    [t],
  );
  const displayLabel = label || formatPresenceLabel(presence, locale, t);

  return (
    <span className={`pd-specialist-presence${isOnline ? " is-online" : ""}`}>
      <span className="pd-specialist-presence-dot" aria-hidden="true" />
      <span>{isLoading ? checkingLabel : displayLabel}</span>
    </span>
  );
}
