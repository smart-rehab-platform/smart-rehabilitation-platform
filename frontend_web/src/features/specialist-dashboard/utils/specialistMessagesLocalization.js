import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";
import { resolveSpecialistMapperContext } from "./specialistDashboardLocalization.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }
  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }
  return fallback;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function getDefaultParentLabel(t = null) {
  return translateKey(t, "roles.parent", "Parent");
}

export function resolveSpecialistConversationSubtitle(conversation, t = null) {
  const context = conversation?.subtitleContext;
  if (context?.kind === "regardingChild" && context.name) {
    return translateKey(t, "specialist.messages.regardingChild", "Regarding {name}", { name: context.name });
  }

  if (context?.kind === "patient" && context.name) {
    return translateKey(t, "specialist.messages.patientLabel", "Patient: {name}", { name: context.name });
  }

  const caseChild = conversation?.caseRequestChildName;
  const patientId = conversation?.patientId;
  const patientName = conversation?.patientName;

  if (caseChild && !patientId) {
    return translateKey(t, "specialist.messages.regardingChild", "Regarding {name}", { name: caseChild });
  }

  if (patientName) {
    return translateKey(t, "specialist.messages.patientLabel", "Patient: {name}", { name: patientName });
  }

  return conversation?.subtitle ?? null;
}

export function formatConversationStartedLabel(createdAt, locale = "en", t = null) {
  if (!createdAt) {
    return null;
  }

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatted = formatAppDate(date, locale);
  return translateKey(
    t,
    "specialist.messages.startedOn",
    "Started {date}",
    { date: formatted ?? translateKey(t, "auth.shared.emptyDisplay", "—") },
  );
}

export function formatSpecialistMessageTime(sentAt, locale = "en", t = null) {
  if (!sentAt) {
    return "";
  }

  const date = sentAt instanceof Date ? sentAt : new Date(sentAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatted = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return formatted || translateKey(t, "common.dateUnavailable", "Date unavailable");
}

export function formatSpecialistMessageDaySeparator(sentAt, locale = "en", t = null, now = new Date()) {
  if (!sentAt) {
    return "";
  }

  const date = sentAt instanceof Date ? sentAt : new Date(sentAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (dayDiff === 0) {
    return translateKey(t, "common.today", "Today");
  }

  if (dayDiff === 1) {
    return translateKey(t, "common.yesterday", "Yesterday");
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function applySpecialistConversationLocalization(conversation, context = {}) {
  if (!conversation) {
    return conversation;
  }

  const { t, locale } = resolveSpecialistMapperContext(context);

  return {
    ...conversation,
    title: conversation.parentName || getDefaultParentLabel(t),
    subtitle: resolveSpecialistConversationSubtitle(conversation, t),
    startedLabel: formatConversationStartedLabel(conversation.createdAt, locale, t),
  };
}

export function buildLocalizedMessageThreadItems(messages, context = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const { t, locale } = resolveSpecialistMapperContext(context);
  const items = [];
  let previousDay = null;

  messages.forEach((message) => {
    const dayKey = message.sentAt ? startOfDay(new Date(message.sentAt)) : null;
    if (dayKey != null && dayKey !== previousDay) {
      items.push({
        type: "separator",
        key: `day-${dayKey}`,
        label: formatSpecialistMessageDaySeparator(message.sentAt, locale, t),
      });
      previousDay = dayKey;
    }

    items.push({
      type: "message",
      key: message.id,
      message: {
        ...message,
        timeLabel: formatSpecialistMessageTime(message.sentAt, locale, t),
      },
    });
  });

  return items;
}

function readPresenceField(presence, keys) {
  if (!presence || typeof presence !== "object") {
    return null;
  }

  for (const key of keys) {
    if (key in presence) {
      return presence[key];
    }
  }

  return null;
}

export function formatSpecialistPresenceLabel(presence, locale = "en", t = null) {
  if (!presence) {
    return translateKey(t, "specialist.messages.presence.offline", "Offline");
  }

  if (readPresenceField(presence, ["is_online", "isOnline"])) {
    return translateKey(t, "specialist.messages.presence.online", "Online");
  }

  const lastSeen = readPresenceField(presence, ["last_seen", "lastSeen"]);
  if (!lastSeen) {
    return translateKey(t, "specialist.messages.presence.offline", "Offline");
  }

  const date = new Date(lastSeen);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "specialist.messages.presence.offline", "Offline");
  }

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) {
    return translateKey(t, "specialist.messages.presence.lastSeenJustNow", "Last seen just now");
  }

  if (diffMinutes < 60) {
    return translateKey(
      t,
      "specialist.messages.presence.lastSeenMinutes",
      "Last seen {count}m ago",
      { count: diffMinutes },
    );
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return translateKey(
      t,
      "specialist.messages.presence.lastSeenHours",
      "Last seen {count}h ago",
      { count: diffHours },
    );
  }

  const formatted = formatAppDateTime(date, locale);
  return translateKey(
    t,
    "specialist.messages.presence.lastSeenAt",
    "Last seen {datetime}",
    { datetime: formatted ?? translateKey(t, "auth.shared.emptyDisplay", "—") },
  );
}

export function getSpecialistMessagesEmptyMessages(t = null) {
  return {
    conversations: translateKey(
      t,
      "specialist.messages.empty.conversations",
      "No parent conversations yet.",
    ),
    filtered: translateKey(
      t,
      "specialist.messages.empty.filtered",
      "No conversations match your search.",
    ),
    chat: translateKey(
      t,
      "specialist.messages.empty.chat",
      "No messages yet. Start the conversation.",
    ),
    selectConversation: translateKey(
      t,
      "specialist.messages.selectConversation",
      "Select a conversation to view messages.",
    ),
  };
}

export function getSpecialistMessageAttachmentLabels(t = null) {
  return {
    imageUnavailable: translateKey(t, "specialist.messages.attachments.imageUnavailable", "Image unavailable"),
    videoUnavailable: translateKey(t, "specialist.messages.attachments.videoUnavailable", "Video unavailable"),
    audioUnavailable: translateKey(t, "specialist.messages.attachments.audioUnavailable", "Audio unavailable"),
    downloadVideo: translateKey(t, "specialist.messages.attachments.downloadVideo", "Download video"),
    pdfDocument: translateKey(t, "specialist.messages.attachments.pdfDocument", "PDF document"),
    viewImage: (label) => translateKey(
      t,
      "specialist.messages.attachments.viewImage",
      "View image: {label}",
      { label },
    ),
    lightboxPreview: translateKey(t, "specialist.messages.lightbox.preview", "Image preview"),
    lightboxClose: translateKey(t, "specialist.messages.lightbox.closePreview", "Close preview"),
    lightboxCloseButton: translateKey(t, "specialist.messages.lightbox.close", "Close"),
  };
}

const SYSTEM_MESSAGE_BODY_KEYS = {
  "Sent an image": "specialist.messages.systemText.sentImage",
  "Sent an audio recording": "specialist.messages.systemText.sentAudio",
  "Sent a PDF file": "specialist.messages.systemText.sentPdf",
  "Sent a video": "specialist.messages.systemText.sentVideo",
  "Sent a file": "specialist.messages.systemText.sentFile",
};

export function localizeSpecialistMessageContent(content, t = null) {
  const rawContent = typeof content === "string" ? content.trim() : "";
  if (!rawContent) {
    return rawContent;
  }

  const translationKey = SYSTEM_MESSAGE_BODY_KEYS[rawContent];
  if (translationKey) {
    return translateKey(t, translationKey, rawContent);
  }

  return content;
}

export function getSpecialistMessagesPageLabels(t = null) {
  return {
    title: translateKey(t, "specialist.messages.title", "Messages"),
    subtitle: translateKey(
      t,
      "specialist.messages.subtitle",
      "Conversations with parents about your patients",
    ),
    conversations: translateKey(t, "specialist.messages.conversations", "Conversations"),
    searchLabel: translateKey(t, "specialist.messages.searchLabel", "Search conversations"),
    searchPlaceholder: translateKey(
      t,
      "specialist.messages.searchPlaceholder",
      "Search parent or patient",
    ),
    backToDashboard: translateKey(t, "specialist.messages.backToDashboard", "Back to Dashboard"),
    conversationDefault: translateKey(t, "specialist.messages.conversationDefault", "Conversation"),
    selectConversation: translateKey(
      t,
      "specialist.messages.selectConversation",
      "Select a conversation to view messages.",
    ),
    loadingConversations: translateKey(
      t,
      "specialist.messages.loadingConversations",
      "Loading conversations...",
    ),
    loadingMessages: translateKey(t, "specialist.messages.loadingMessages", "Loading messages..."),
    retry: translateKey(t, "common.retry", "Retry"),
  };
}

export function getSpecialistMessageComposerLabels(t = null) {
  return {
    placeholder: translateKey(t, "specialist.messages.composer.placeholder", "Write a message..."),
    send: translateKey(t, "specialist.messages.composer.send", "Send"),
    sending: translateKey(t, "specialist.messages.composer.sending", "Sending..."),
    removeAttachment: translateKey(t, "specialist.messages.composer.removeAttachment", "Remove"),
    stopRecording: translateKey(t, "specialist.messages.composer.stopRecording", "Stop recording"),
    addAttachment: translateKey(t, "specialist.messages.composer.addAttachment", "Add attachment"),
    chooseImage: translateKey(t, "specialist.messages.composer.chooseImage", "Choose Image"),
    recordAudio: translateKey(t, "specialist.messages.composer.recordAudio", "Record Audio"),
    chooseFile: translateKey(t, "specialist.messages.composer.chooseFile", "Choose File"),
    chooseVideo: translateKey(t, "specialist.messages.composer.chooseVideo", "Choose Video"),
    selectedImageAlt: translateKey(
      t,
      "specialist.messages.composer.selectedImageAlt",
      "Selected image preview",
    ),
    uploading: (percent) => translateKey(
      t,
      "specialist.messages.composer.uploading",
      "Uploading… {percent}%",
      { percent },
    ),
  };
}

export function getSpecialistMessageAttachmentValidationMessages(t = null) {
  return {
    selectFile: translateKey(t, "specialist.messages.attachmentValidation.selectFile", "Please select a file."),
    unsupportedType: translateKey(
      t,
      "specialist.messages.attachmentValidation.unsupportedType",
      "This file type is not supported.",
    ),
    tooLarge: (size) => translateKey(
      t,
      "specialist.messages.attachmentValidation.tooLarge",
      "File is too large. Maximum allowed size is {size}.",
      { size },
    ),
    recordingNotSupported: translateKey(
      t,
      "specialist.messages.attachmentValidation.recordingNotSupported",
      "Audio recording is not supported in this browser.",
    ),
    micPermission: translateKey(
      t,
      "specialist.messages.attachmentValidation.micPermission",
      "Microphone permission is required to record audio.",
    ),
    micAccessFailed: translateKey(
      t,
      "specialist.messages.attachmentValidation.micAccessFailed",
      "Unable to access the microphone.",
    ),
    recordingFailed: translateKey(
      t,
      "specialist.messages.attachmentValidation.recordingFailed",
      "Recording failed. Please try again.",
    ),
    noAudioRecorded: translateKey(
      t,
      "specialist.messages.attachmentValidation.noAudioRecorded",
      "No audio was recorded.",
    ),
    processRecordingFailed: translateKey(
      t,
      "specialist.messages.attachmentValidation.processRecordingFailed",
      "Unable to process the recording.",
    ),
  };
}

export function localizeSpecialistAttachmentValidationError(message, t = null) {
  if (typeof message !== "string" || !message.trim()) {
    return message;
  }

  const validation = getSpecialistMessageAttachmentValidationMessages(t);
  const tooLargeMatch = message.match(/^File is too large\. Maximum allowed size is (.+)\.$/);
  if (tooLargeMatch) {
    return validation.tooLarge(tooLargeMatch[1]);
  }

  const knownMessages = {
    "Please select a file.": validation.selectFile,
    "This file type is not supported.": validation.unsupportedType,
  };

  return knownMessages[message.trim()] ?? message;
}

export function getSpecialistMessagesErrorMessages(t = null) {
  return {
    signInRequired: translateKey(
      t,
      "specialist.messages.errors.signInRequired",
      "Please sign in to view messages.",
    ),
    loadConversationsFailed: translateKey(
      t,
      "specialist.messages.errors.loadConversationsFailed",
      "Failed to load conversations.",
    ),
    loadMessagesFailed: translateKey(
      t,
      "specialist.messages.errors.loadMessagesFailed",
      "Failed to load messages.",
    ),
    sendFailed: translateKey(t, "specialist.messages.errors.sendFailed", "Failed to send message."),
    attachmentUrlMissing: translateKey(
      t,
      "specialist.messages.errors.attachmentUrlMissing",
      "Attachment upload did not return a file URL.",
    ),
  };
}
