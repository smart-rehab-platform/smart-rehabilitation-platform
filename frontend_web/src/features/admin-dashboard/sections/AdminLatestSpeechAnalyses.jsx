import { AudioLines } from "lucide-react";
import { AdminAiInsightList } from "../components/AdminAiInsightList";

export function AdminLatestSpeechAnalyses({
  records = [],
  labels,
  isLoading = false,
  onSelectPatient,
}) {
  return (
    <AdminAiInsightList
      sectionId="admin-ai-speech-analyses"
      title={labels.speech.title}
      records={records}
      labels={labels}
      isLoading={isLoading}
      emptyMessage={labels.speech.empty}
      icon={AudioLines}
      iconTone="blue"
      onSelectPatient={onSelectPatient}
    />
  );
}
