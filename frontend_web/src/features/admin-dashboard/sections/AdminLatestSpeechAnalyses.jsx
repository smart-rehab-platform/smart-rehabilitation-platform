import { AudioLines } from "lucide-react";
import { AdminAiInsightList } from "../components/AdminAiInsightList";

export function AdminLatestSpeechAnalyses({
  records = [],
  isLoading = false,
  onSelectPatient,
}) {
  return (
    <AdminAiInsightList
      sectionId="admin-ai-speech-analyses"
      title="Latest Speech Analyses"
      records={records}
      isLoading={isLoading}
      emptyMessage="No speech analyses yet."
      icon={AudioLines}
      iconTone="blue"
      onSelectPatient={onSelectPatient}
    />
  );
}
