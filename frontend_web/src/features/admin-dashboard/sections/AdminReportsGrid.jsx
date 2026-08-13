import { AdminReportCard, AdminReportCardSkeleton } from "../components/AdminReportCard";

export function AdminReportsGrid({
  reports = [],
  isLoading = false,
  onOpenReport,
}) {
  if (isLoading) {
    return (
      <div className="pd-admin-reports-grid" aria-busy="true" aria-label="Reports loading">
        {Array.from({ length: 6 }).map((_, index) => (
          <AdminReportCardSkeleton key={`report-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="pd-admin-reports-grid" aria-label="Reports">
      {reports.map((report) => (
        <AdminReportCard
          key={`${report.isAiReport ? "ai" : "regular"}-${report.id}`}
          report={report}
          onOpen={onOpenReport}
        />
      ))}
    </div>
  );
}
