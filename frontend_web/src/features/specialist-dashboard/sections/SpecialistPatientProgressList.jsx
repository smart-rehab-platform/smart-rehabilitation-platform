import { ChevronRight, TrendingUp } from "lucide-react";
import { ProgressBar } from "../../shared-dashboard/components/ProgressBar";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistPatientProgressList({
  items = [],
  viewPatientLabel = "View Patient",
  getViewPatientAriaLabel = (name) => `View patient ${name}`,
  onSelectPatient,
}) {
  return (
    <ul className="pd-specialist-progress-page-list">
      {items.map((item) => (
        <li key={item.patientId}>
          <button
            type="button"
            className="pd-card pd-card-pad pd-specialist-progress-row"
            onClick={() => onSelectPatient?.(item)}
            aria-label={getViewPatientAriaLabel(item.patientName)}
          >
            <UserProfileAvatar
              imageUrl={item.profileImageUrl}
              initials={getInitials(item.patientName, "P")}
              alt=""
              shellClassName="pd-avatar pd-specialist-preview-avatar"
              fallbackClassName="pd-avatar pd-specialist-preview-avatar"
              className="pd-avatar-photo"
            />
            <span className="pd-specialist-progress-row-body">
              <span className="pd-specialist-progress-row-top">
                <strong dir="auto">{item.patientName}</strong>
                <span className="pd-specialist-progress-row-percent">{item.percent}%</span>
                <TrendingUp
                  size={16}
                  aria-hidden="true"
                  className="pd-specialist-progress-row-trend"
                />
              </span>
              <ProgressBar hideMeta percent={item.percent} tone="cyan" />
              {item.updatedLabel ? (
                <span className="pd-section-sub pd-specialist-progress-row-updated">{item.updatedLabel}</span>
              ) : null}
              <span className="pd-specialist-progress-row-action">{viewPatientLabel}</span>
            </span>
            <ChevronRight
              size={18}
              aria-hidden="true"
              className="pd-specialist-progress-row-chevron"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
