import { FileCheck2 } from "lucide-react";
import { UserProfileAvatar } from "../../shared-dashboard/components/UserProfileAvatar";
import { AdminReportTypeBadge } from "../components/AdminReportTypeBadge";
import { getInitials } from "../../specialist-dashboard/utils/specialistScheduleUtils";

function getPatientInitials(name) {
  return getInitials(name, "P");
}

export function AdminReportDetailsHero({ report, labels }) {
  if (!report || !labels) {
    return null;
  }

  const emptyDisplay = labels.emptyDisplay;
  const patientName = report.patientName || emptyDisplay;
  const typeLabel = report.typeBadgeLabel || report.categoryLabel;
  const pdfReadyLabel = report.pdfReadyLabel;
  const dateLabel = report.dateLabel || emptyDisplay;
  const showPeriod = Boolean(
    report.isAiReport && report.periodStartLabel && report.periodEndLabel,
  );

  return (
    <section
      className="pd-card pd-card-pad pd-admin-report-details-hero pd-section-enter"
      aria-label={labels.detailsTitle}
    >
      <div className="pd-admin-report-details-hero-top">
        <UserProfileAvatar
          imageUrl={report.patientProfileImageUrl ?? report.profileImageUrl}
          initials={getPatientInitials(report.patientName)}
          alt=""
          shellClassName="pd-admin-report-avatar pd-admin-report-avatar-lg"
          fallbackClassName="pd-admin-report-avatar pd-admin-report-avatar-lg"
          className="pd-avatar-photo"
        />
        <div className="pd-admin-report-details-hero-copy">
          <p className="pd-admin-report-details-patient">{patientName}</p>
          <h1 className="pd-admin-report-details-title" dir="auto">{report.title || "Report"}</h1>
        </div>
      </div>

      <div className="pd-admin-report-card-meta">
        {typeLabel ? (
          <AdminReportTypeBadge
            label={typeLabel}
            isAiReport={Boolean(report.isAiReport)}
          />
        ) : null}
        {pdfReadyLabel ? (
          <span className="pd-admin-report-pdf-badge">
            <FileCheck2 size={13} aria-hidden="true" />
            {pdfReadyLabel}
          </span>
        ) : null}
        <span className="pd-admin-report-card-date">{dateLabel}</span>
      </div>

      {showPeriod ? (
        <p className="pd-admin-report-details-period">
          {labels.periodRange
            .replace("{start}", report.periodStartLabel)
            .replace("{end}", report.periodEndLabel)}
        </p>
      ) : null}
    </section>
  );
}
