import { useLocale } from "../../../../context/useLocale.js";
import { getSuggestedHomePracticeTitle } from "../../utils/parentAiAssistantUtils";

export function SuggestedHomePracticeCard({ practice }) {
  const { t } = useLocale();

  if (!practice?.body) {
    return null;
  }

  return (
    <section className="pd-ai-suggested-practice" aria-label={getSuggestedHomePracticeTitle(t)}>
      <h3 className="pd-ai-suggested-practice-title">
        {practice.title || getSuggestedHomePracticeTitle(t)}
      </h3>
      <p className="pd-ai-suggested-practice-body" dir="auto">{practice.body}</p>
    </section>
  );
}
