import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { SupportRequestStatusBadge } from "../../../shared-dashboard/components/supportRequests/SupportRequestStatusBadge";
import { getSpecialistSupportPageLabels } from "../../utils/specialistSupportRequestsLocalization.js";

export function SpecialistSupportRequestListItem({ request, onSelect }) {
  const { t } = useLocale();
  const pageLabels = useMemo(() => getSpecialistSupportPageLabels(t), [t]);

  if (!request) {
    return null;
  }

  return (
    <button
      type="button"
      className="pd-support-request-list-item pd-section-enter"
      onClick={() => onSelect?.(request.id)}
    >
      <div className="pd-support-request-list-item-top">
        <h2 className="pd-support-request-list-item-title" dir="auto">{request.subject}</h2>
        <SupportRequestStatusBadge
          status={request.status}
          label={request.statusLabel}
          tone={request.statusTone}
        />
      </div>
      <div className="pd-support-request-list-item-meta">
        <span>{request.categoryLabel}</span>
        <span>{pageLabels.lastActivity(request.lastMessageAtLabel)}</span>
        <span>{pageLabels.created(request.createdAtLabel)}</span>
      </div>
      <span className="pd-parent-complaint-card-link">
        {pageLabels.viewRequest}
        <ChevronRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
