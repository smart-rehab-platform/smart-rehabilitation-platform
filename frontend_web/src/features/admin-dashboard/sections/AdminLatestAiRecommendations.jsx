import { Lightbulb } from "lucide-react";
import { AdminAiInsightList } from "../components/AdminAiInsightList";

export function AdminLatestAiRecommendations({
  records = [],
  isLoading = false,
  onSelectPatient,
}) {
  return (
    <AdminAiInsightList
      sectionId="admin-ai-recommendations"
      title="Latest AI Recommendations"
      records={records}
      isLoading={isLoading}
      emptyMessage="No AI recommendations yet."
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
