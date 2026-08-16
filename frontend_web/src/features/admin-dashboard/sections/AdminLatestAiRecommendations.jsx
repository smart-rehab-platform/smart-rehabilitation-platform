import { Lightbulb } from "lucide-react";
import { AdminAiInsightList } from "../components/AdminAiInsightList";

export function AdminLatestAiRecommendations({
  records = [],
  labels,
  isLoading = false,
  onSelectPatient,
}) {
  return (
    <AdminAiInsightList
      sectionId="admin-ai-recommendations"
      title={labels.recommendations.title}
      records={records}
      labels={labels}
      isLoading={isLoading}
      emptyMessage={labels.recommendations.empty}
      icon={Lightbulb}
      iconTone="teal"
      onSelectPatient={onSelectPatient}
      renderBadge={(record) => ({
        label: record.statusLabel,
        tone: record.statusTone,
      })}
    />
  );
}
