import { ChevronRight } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { getInitials } from "../utils/specialistScheduleUtils";

export function SpecialistReportCard({ report, onClick }) {
  const { t } = useLocale();

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
        <strong>{report.titleLabel || report.title}</strong>
        <span className="pd-specialist-report-card-patient">{report.patientName}</span>
        <span className="pd-specialist-report-card-meta">
          <StatusBadge label={report.typeBadgeLabel} tone="blue" />
          {report.isAi ? (
            <StatusBadge
              label={report.aiBadgeLabel || t("specialist.reports.type.ai")}
              tone="purple"
            />
          ) : null}
          {report.isPdfReady ? (
            <StatusBadge
              label={report.pdfReadyLabel || t("specialist.reports.status.pdfReady")}
              tone="success"
            />
          ) : null}
          <span className="pd-section-sub">{report.dateLabel}</span>
        </span>
        {report.summary ? (
          <span className="pd-specialist-report-card-summary" dir="auto">{report.summary}</span>
        ) : null}
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}
