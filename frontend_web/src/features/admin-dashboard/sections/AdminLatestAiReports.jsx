import { FileText } from "lucide-react";
import { AdminAiInsightList } from "../components/AdminAiInsightList";

export function AdminLatestAiReports({
  records = [],
  isLoading = false,
}) {
  return (
    <AdminAiInsightList
      sectionId="admin-ai-reports"
      title="Latest AI Reports"
      records={records}
      isLoading={isLoading}
      emptyMessage="No AI reports yet."
      icon={FileText}
      iconTone="amber"
      readOnly
    />
  );
}
