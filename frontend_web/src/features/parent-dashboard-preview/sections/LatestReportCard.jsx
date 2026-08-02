import { ArrowRight } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

export function LatestReportCard({ report, onOpen }) {
  if (!report) return null;

  return (
    <button
      type="button"
      className="pd-shortcut-row pd-section-enter"
      onClick={onOpen}
      aria-label={`Latest report: ${report.title}. View report.`}
    >
      <span className="pd-shortcut-row-left">
        <span className="pd-shortcut-icon pd-shortcut-icon-report" aria-hidden="true">
          <PlatformMaterialIcon icon="report" size={18} />
        </span>
        <span className="pd-shortcut-copy">
          <span className="pd-shortcut-label">Latest Report</span>
          <span className="pd-shortcut-detail">{report.title}</span>
        </span>
      </span>
      <span className="pd-shortcut-action">
        View Report
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </button>
  );
}
