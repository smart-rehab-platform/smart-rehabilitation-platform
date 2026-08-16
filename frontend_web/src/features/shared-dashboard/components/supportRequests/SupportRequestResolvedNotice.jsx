import { CheckCircle2 } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";

export function SupportRequestResolvedNotice({ resolvedAtLabel }) {
  const { t } = useLocale();
  const unavailable = t("common.dateUnavailable");
  const resolvedDate = resolvedAtLabel && resolvedAtLabel !== unavailable ? resolvedAtLabel : null;

  return (
    <div className="pd-support-request-resolved-notice" aria-live="polite">
      <CheckCircle2 size={16} aria-hidden="true" />
      <span>
        <strong>{t("supportRequests.resolvedTitle")}</strong>
        {resolvedDate ? ` · ${resolvedDate}` : null}
        <span className="pd-support-request-resolved-notice-copy">{t("supportRequests.resolvedReadOnly")}</span>
      </span>
    </div>
  );
}
