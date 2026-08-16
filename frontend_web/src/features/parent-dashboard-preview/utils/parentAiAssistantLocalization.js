import { formatParentDateTime, translateKey } from "./parentLocalizationCore.js";

export const AI_QUICK_PROMPT_KEYS = [
  "parent.aiAssistant.prompt.explainExercise",
  "parent.aiAssistant.prompt.summarizeProgress",
  "parent.aiAssistant.prompt.focusToday",
  "parent.aiAssistant.prompt.explainReport",
];

const EN_QUICK_PROMPTS = [
  "Explain today's exercise",
  "Summarize my child's progress",
  "What should I focus on today?",
  "Explain the latest report",
];

export function getAiDisclaimerText(t) {
  return translateKey(
    t,
    "parent.aiAssistant.disclaimer",
    "AI guidance supports, but does not replace, your child's specialist.",
  );
}

export function getAiSafetyNotice(t) {
  return translateKey(
    t,
    "parent.aiAssistant.safetyNotice",
    "AI guidance is for support only. Always follow your specialist's instructions.",
  );
}

export function buildAiQuickPrompts(t) {
  return AI_QUICK_PROMPT_KEYS.map((key, index) => translateKey(t, key, EN_QUICK_PROMPTS[index]));
}

export function getAiEmptyMessages(t) {
  return {
    noChild: translateKey(t, "parent.aiAssistant.empty.noChild", "Select a child to begin."),
    noConversations: translateKey(t, "parent.aiAssistant.empty.noConversations", "No conversations yet."),
    noConversationSelected: translateKey(
      t,
      "parent.aiAssistant.empty.noConversationSelected",
      "Start a conversation about your child's home practice or progress.",
    ),
    noMessages: translateKey(
      t,
      "parent.aiAssistant.empty.noMessages",
      "Ask me anything about your child's exercises, reports, or progress.",
    ),
  };
}

export function getAiSenderLabel(sender, t = null) {
  const normalized = typeof sender === "string" ? sender.trim().toLowerCase() : "";
  if (normalized === "user") {
    return translateKey(t, "parent.aiAssistant.sender.you", "You");
  }
  if (normalized === "bot" || normalized === "assistant") {
    return translateKey(t, "parent.aiAssistant.sender.assistant", "AI Assistant");
  }
  return null;
}

export function getNewConversationTitle(t) {
  return translateKey(t, "parent.aiAssistant.newConversation", "New conversation");
}

export function getSuggestedHomePracticeTitle(t) {
  return translateKey(t, "parent.aiAssistant.suggestedHomePractice", "Suggested Home Practice");
}

export function formatAiDisplayDate(value, locale = "en", t = null) {
  return formatParentDateTime(value, locale, t);
}

/** @deprecated Use getAiDisclaimerText(t) */
export const AI_DISCLAIMER_TEXT = getAiDisclaimerText(null);

/** @deprecated Use getAiSafetyNotice(t) */
export const AI_SAFETY_NOTICE = getAiSafetyNotice(null);

/** @deprecated Use buildAiQuickPrompts(t) */
export const AI_QUICK_PROMPTS = buildAiQuickPrompts(null);

/** @deprecated Use getAiEmptyMessages(t) */
export const AI_EMPTY_MESSAGES = getAiEmptyMessages(null);
