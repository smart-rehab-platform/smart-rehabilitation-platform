import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  PARENT_WEB_ROUTES,
  buildParentMessagesPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import {
  useParentConversation,
  useParentMessageComposer,
  useParentMessages,
} from "./hooks/useParentMessages";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  formatMessageTime,
  getLatestReadOutgoingMessageId,
  getMessagesChatEmpty,
  getMessagesEmptyMessage,
} from "./utils/parentMessagesUtils";
import { MessageAttachmentDisplay } from "./components/messages/MessageAttachmentDisplay";
import { MessagesComposer } from "./components/messages/MessagesComposer";
import { useMessageAttachmentDraft } from "./hooks/useMessageAttachmentDraft";
import "./styles/parentDashboardTokens.css";

const MOBILE_CHAT_BREAKPOINT = 900;
const THREAD_SCROLL_THRESHOLD_PX = 80;

export default function ParentMessagesPage() {
  const navigate = useNavigate();
  const { conversationId: routeConversationId } = useParams();
  const { t, locale } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [composerValue, setComposerValue] = useState("");
  const [mobileShowsChat, setMobileShowsChat] = useState(Boolean(routeConversationId));
  const [isNarrowLayout, setIsNarrowLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_CHAT_BREAKPOINT : false,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const threadScrollRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);
  const {
    conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useParentMessages(parentUserId);

  const activeConversationId = routeConversationId || null;
  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
    markConversationNotificationsRead,
    refetch: refetchNotifications,
  } = useParentNotifications(parentUserId);

  const handleIncomingMessages = useCallback(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  const {
    messages,
    isLoadingMessages,
    messagesError,
    refetchMessages,
    appendMessage,
    setSendingState,
  } = useParentConversation(activeConversationId, parentUserId, {
    onIncomingMessages: handleIncomingMessages,
  });

  const latestReadOutgoingId = useMemo(
    () => getLatestReadOutgoingMessageId(messages, parentUserId),
    [messages, parentUserId],
  );

  const handleSendSuccess = useCallback((message) => {
    shouldStickToBottomRef.current = true;
    appendMessage(message);
    setComposerValue("");
    refetchConversations();
    refetchNotifications();
  }, [appendMessage, refetchConversations, refetchNotifications]);

  const {
    isSending,
    uploadProgress,
    sendError,
    sendMessage,
    clearSendError,
  } = useParentMessageComposer({
    conversationId: activeConversationId,
    onSendSuccess: handleSendSuccess,
    setSendingState,
  });

  const attachmentDraft = useMessageAttachmentDraft();
  const {
    draft,
    draftError,
    isRecording,
    recordingError,
    selectFile,
    clearDraft,
    startRecording,
    stopRecording,
    cancelRecording,
    clearDraftError,
    clearRecordingError,
  } = attachmentDraft;

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const navigation = useParentDashboardNavigation({
    selectedChildId: activeConversation?.patientId ?? null,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  const navigateToConversation = useCallback((conversationId) => {
    navigate(buildParentMessagesPath(conversationId));
    if (isNarrowLayout) {
      setMobileShowsChat(Boolean(conversationId));
    }
  }, [navigate, isNarrowLayout]);

  useEffect(() => {
    clearDraft();
    cancelRecording();
  }, [activeConversationId, cancelRecording, clearDraft]);

  useEffect(() => {
    if (!activeConversationId) {
      return undefined;
    }

    markConversationNotificationsRead(activeConversationId);
  }, [activeConversationId, markConversationNotificationsRead]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onResize = () => {
      const narrow = window.innerWidth <= MOBILE_CHAT_BREAKPOINT;
      setIsNarrowLayout(narrow);
      if (!narrow) {
        setMobileNavOpen(false);
        setMobileShowsChat(Boolean(activeConversationId));
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeConversationId]);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    document.body.classList.add("pd-preview-drawer-open");
    return () => document.body.classList.remove("pd-preview-drawer-open");
  }, [mobileNavOpen]);

  const badges = useMemo(() => ({
    notifications:
      !notificationsError && !isLoadingNotifications && unreadCount > 0
        ? unreadCount
        : null,
    messages: messageUnreadCount > 0 ? messageUnreadCount : null,
  }), [
    notificationsError,
    isLoadingNotifications,
    unreadCount,
    messageUnreadCount,
  ]);

  const scrollThreadToBottom = useCallback((behavior = "auto") => {
    const container = threadScrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const handleThreadScroll = useCallback(() => {
    const container = threadScrollRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom <= THREAD_SCROLL_THRESHOLD_PX;
  }, []);

  useEffect(() => {
    shouldStickToBottomRef.current = true;
    scrollThreadToBottom("auto");
  }, [activeConversationId, scrollThreadToBottom]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) {
      return;
    }

    scrollThreadToBottom(isSending ? "smooth" : "auto");
  }, [messages, isSending, scrollThreadToBottom]);

  const handleSend = useCallback(async () => {
    clearSendError();
    clearDraftError();
    clearRecordingError();
    const result = await sendMessage(composerValue, draft);
    if (result.ok) {
      setComposerValue("");
      clearDraft();
    }
  }, [
    clearDraft,
    clearDraftError,
    clearRecordingError,
    clearSendError,
    composerValue,
    draft,
    sendMessage,
  ]);

  const showListPanel = !isNarrowLayout || !mobileShowsChat;
  const showChatPanel = !isNarrowLayout || mobileShowsChat;

  const renderConversationList = () => {
    if (isLoadingConversations) {
      return <p className="pd-inline-loading">{t("parent.pages.messages.loading")}</p>;
    }

    if (conversationsError) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-error">{conversationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchConversations}>
            {t("parent.common.retry")}
          </button>
        </div>
      );
    }

    if (conversations.length === 0) {
      return <p className="pd-section-sub">{getMessagesEmptyMessage(t)}</p>;
    }

    return (
      <div className="pd-messages-list">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={`pd-messages-list-item${
              conversation.id === activeConversationId ? " is-active" : ""
            }`}
            onClick={() => navigateToConversation(conversation.id)}
          >
            <strong>{conversation.title}</strong>
            {conversation.subtitle ? (
              <span>{conversation.subtitle}</span>
            ) : null}
          </button>
        ))}
      </div>
    );
  };

  const handleBack = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard);
  }, [navigate]);

  const renderThread = () => {
    if (!activeConversationId) {
      return <p className="pd-section-sub">{t("parent.messages.selectConversationView")}</p>;
    }

    if (isLoadingMessages) {
      return <p className="pd-inline-loading">{t("parent.pages.messages.loadingThread")}</p>;
    }

    if (messagesError) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-error">{messagesError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchMessages}>
            {t("parent.common.retry")}
          </button>
        </div>
      );
    }

    if (messages.length === 0) {
      return <p className="pd-section-sub">{getMessagesChatEmpty(t)}</p>;
    }

    return messages.map((message) => {
      const isOwn = message.senderId === parentUserId;
      const showSeen = isOwn && message.id === latestReadOutgoingId;
      return (
        <div
          key={message.id}
          className={`pd-message-block${isOwn ? " is-own" : " is-other"}`}
        >
          <article
            className={`pd-message-bubble${isOwn ? " is-own" : " is-other"}`}
          >
            {!isOwn && message.senderName ? (
              <span className="pd-message-sender">{message.senderName}</span>
            ) : null}
            {message.content ? <p dir="auto">{message.content}</p> : null}
            {message.hasAttachments ? (
              <div className="pd-message-attachments">
                {message.attachments.map((attachment) => (
                  <MessageAttachmentDisplay key={attachment.id || attachment.fileUrl} attachment={attachment} />
                ))}
              </div>
            ) : null}
            {message.sentAt ? (
              <time className="pd-message-time">{formatMessageTime(message.sentAt, locale, t)}</time>
            ) : null}
          </article>
          {showSeen ? <span className="pd-message-seen">Seen</span> : null}
        </div>
      );
    });
  };

  return (
    <div className="pd-preview">
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        badges={badges}
        parent={parent}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        onNotificationSelect={navigation.handleNotificationSelect}
        onViewAllNotifications={navigation.handleViewAllNotifications}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={navigation.handleSidebarNav}
        onSignOut={navigation.handleSignOut}
        onViewProfile={navigation.handleViewProfile}
        onMessages={navigation.handleMessages}
      >
        <div className="pd-task-hub-page pd-messages-page">
          <div className="pd-task-hub-toolbar">
            <button type="button" className="pd-btn pd-btn-soft" onClick={handleBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("parent.common.backToDashboard")}
            </button>
            {isNarrowLayout && mobileShowsChat ? (
              <button
                type="button"
                className="pd-btn pd-btn-soft"
                onClick={() => setMobileShowsChat(false)}
              >
                {t("parent.messages.conversationsButton")}
              </button>
            ) : null}
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{t("parent.messages.title")}</h1>
            <p className="pd-task-hub-subtitle">
              {t("parent.messages.subtitle")}
            </p>
          </header>

          <div className="pd-messages-layout">
            {showListPanel ? (
              <aside className="pd-messages-sidebar pd-card pd-card-pad">
                <h2 className="pd-section-title">{t("parent.messages.conversations")}</h2>
                <div className="pd-messages-list-scroll">
                  {renderConversationList()}
                </div>
              </aside>
            ) : null}

            {showChatPanel ? (
              <section className="pd-messages-chat pd-card pd-card-pad">
                <div className="pd-messages-chat-header">
                  <h2 className="pd-section-title">
                    {activeConversation?.title || t("parent.messages.conversationDefault")}
                  </h2>
                  {activeConversation?.subtitle ? (
                    <p className="pd-section-sub">{activeConversation.subtitle}</p>
                  ) : null}
                </div>

                <div
                  ref={threadScrollRef}
                  className="pd-messages-thread"
                  onScroll={handleThreadScroll}
                >
                  {renderThread()}
                </div>

                {activeConversationId ? (
                  <MessagesComposer
                    composerValue={composerValue}
                    onComposerChange={setComposerValue}
                    onSend={handleSend}
                    isSending={isSending}
                    sendError={sendError}
                    uploadProgress={uploadProgress}
                    draft={draft}
                    draftError={draftError}
                    isRecording={isRecording}
                    recordingError={recordingError}
                    onSelectImage={selectFile}
                    onSelectVideo={selectFile}
                    onSelectFile={selectFile}
                    onClearDraft={clearDraft}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    disabled={false}
                  />
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </ParentDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
