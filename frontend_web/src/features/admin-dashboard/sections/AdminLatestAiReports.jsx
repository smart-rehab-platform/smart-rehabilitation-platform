import { FileText } from "lucide-react";
import { AdminAiInsightList } from "../components/AdminAiInsightList";

export function AdminLatestAiReports({
  records = [],
  labels,
  isLoading = false,
}) {
  return (
    <AdminAiInsightList
      sectionId="admin-ai-reports"
      title={labels.reports.title}
      records={records}
      labels={labels}
      isLoading={isLoading}
      emptyMessage={labels.reports.empty}
      icon={FileText}
      iconTone="amber"
      readOnly
    />
  );
}
