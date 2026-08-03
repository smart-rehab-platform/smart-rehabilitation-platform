import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  PARENT_WEB_ROUTES,
  buildParentMessagesPath,
} from "../../routes/parentDashboardRoutes";
import { parentDashboardMock } from "./mock/parentDashboardMock";
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
  MESSAGES_CHAT_EMPTY,
  MESSAGES_EMPTY_MESSAGE,
  formatMessageTime,
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
    messages,
    isLoadingMessages,
    messagesError,
    refetchMessages,
    appendMessage,
  } = useParentConversation(activeConversationId, parentUserId);

  const handleSendSuccess = useCallback((message) => {
    shouldStickToBottomRef.current = true;
    appendMessage(message);
    setComposerValue("");
    refetchConversations();
  }, [appendMessage, refetchConversations]);

  const {
    isSending,
    uploadProgress,
    sendError,
    sendMessage,
    clearSendError,
  } = useParentMessageComposer({
    conversationId: activeConversationId,
    onSendSuccess: handleSendSuccess,
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

  const {
    notifications,
    unreadCount,
    messageUnreadCount,
    isLoadingNotifications,
    notificationsError,
    markNotificationRead,
  } = useParentNotifications(parentUserId);

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
      return <p className="pd-inline-loading">Loading conversations...</p>;
    }

    if (conversationsError) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-error">{conversationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchConversations}>
            Retry
          </button>
        </div>
      );
    }

    if (conversations.length === 0) {
      return <p className="pd-section-sub">{MESSAGES_EMPTY_MESSAGE}</p>;
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
      return <p className="pd-section-sub">Select a conversation to view messages.</p>;
    }

    if (isLoadingMessages) {
      return <p className="pd-inline-loading">Loading messages...</p>;
    }

    if (messagesError) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-error">{messagesError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchMessages}>
            Retry
          </button>
        </div>
      );
    }

    if (messages.length === 0) {
      return <p className="pd-section-sub">{MESSAGES_CHAT_EMPTY}</p>;
    }

    return messages.map((message) => {
      const isOwn = message.senderId === parentUserId;
      return (
        <article
          key={message.id}
          className={`pd-message-bubble${isOwn ? " is-own" : " is-other"}`}
        >
          {!isOwn && message.senderName ? (
            <span className="pd-message-sender">{message.senderName}</span>
          ) : null}
          {message.content ? <p>{message.content}</p> : null}
          {message.hasAttachments ? (
            <div className="pd-message-attachments">
              {message.attachments.map((attachment) => (
                <MessageAttachmentDisplay key={attachment.id || attachment.fileUrl} attachment={attachment} />
              ))}
            </div>
          ) : null}
          {message.sentAt ? (
            <time className="pd-message-time">{formatMessageTime(message.sentAt)}</time>
          ) : null}
        </article>
      );
    });
  };

  return (
    <div className="pd-preview">
      <ParentDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={parentDashboardMock.navItems}
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
              Back to Dashboard
            </button>
            {isNarrowLayout && mobileShowsChat ? (
              <button
                type="button"
                className="pd-btn pd-btn-soft"
                onClick={() => setMobileShowsChat(false)}
              >
                Conversations
              </button>
            ) : null}
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">Messages</h1>
            <p className="pd-task-hub-subtitle">
              Secure conversations with specialists about your children.
            </p>
          </header>

          <div className="pd-messages-layout">
            {showListPanel ? (
              <aside className="pd-messages-sidebar pd-card pd-card-pad">
                <h2 className="pd-section-title">Conversations</h2>
                <div className="pd-messages-list-scroll">
                  {renderConversationList()}
                </div>
              </aside>
            ) : null}

            {showChatPanel ? (
              <section className="pd-messages-chat pd-card pd-card-pad">
                <div className="pd-messages-chat-header">
                  <h2 className="pd-section-title">
                    {activeConversation?.title || "Conversation"}
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
