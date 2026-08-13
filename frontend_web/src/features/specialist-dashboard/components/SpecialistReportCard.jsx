import { ChevronRight } from "lucide-react";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistReportCard({ report, onClick }) {
  return (
    <button
      type="button"
      className="pd-card pd-card-pad pd-specialist-report-card"
      onClick={() => onClick?.(report)}
    >
      <UserProfileAvatar
        imageUrl={null}
        initials={getInitials(report.patientName, "P")}
        alt=""
        shellClassName="pd-avatar pd-specialist-preview-avatar"
        fallbackClassName="pd-avatar pd-specialist-preview-avatar"
        className="pd-avatar-photo"
      />
      <span className="pd-specialist-report-card-copy">
        <strong>{report.title}</strong>
        <span className="pd-specialist-report-card-patient">{report.patientName}</span>
        <span className="pd-specialist-report-card-meta">
          <StatusBadge label={report.typeBadgeLabel} tone="blue" />
          {report.isAi ? <StatusBadge label="AI" tone="purple" /> : null}
          {report.isPdfReady ? <StatusBadge label="PDF Ready" tone="success" /> : null}
          <span className="pd-section-sub">{report.dateLabel}</span>
        </span>
        {report.summary ? (
          <span className="pd-specialist-report-card-summary">{report.summary}</span>
        ) : null}
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}
