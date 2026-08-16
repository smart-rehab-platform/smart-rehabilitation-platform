import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  SPECIALIST_WEB_ROUTES,
  buildSpecialistMessagesPath,
} from "../../routes/specialistDashboardRoutes";
import familyRestroomIcon from "../../assets/icons/family_restroom.svg";
import { getConversation } from "../../services/specialistCommunicationService";
import { UserProfileAvatar } from "../shared-dashboard/components/UserProfileAvatar";
import { SpecialistMessageAttachmentDisplay } from "./components/messages/SpecialistMessageAttachmentDisplay";
import { SpecialistMessagesComposer } from "./components/messages/SpecialistMessagesComposer";
import { SpecialistPresenceStatus } from "./components/messages/SpecialistPresenceStatus";
import { useSpecialistChatThread, useSpecialistMessageComposer } from "./hooks/useSpecialistChatThread";
import { useSpecialistConversations } from "./hooks/useSpecialistConversations";
import { useSpecialistMessageAttachmentDraft } from "./hooks/useSpecialistMessageAttachmentDraft";
import { useSpecialistPresence } from "./hooks/useSpecialistPresence";
import { useSpecialistShell } from "./hooks/useSpecialistShell";
import { SpecialistDashboardShell } from "./layout/SpecialistDashboardShell";
import {
  applySpecialistConversationLocalization,
  buildLocalizedMessageThreadItems,
  getSpecialistMessagesEmptyMessages,
  getSpecialistMessagesPageLabels,
  localizeSpecialistMessageContent,
} from "./utils/specialistMessagesLocalization.js";
import {
  filterSpecialistConversations,
  mapSpecialistConversation,
  getLatestReadOutgoingMessageId,
} from "./utils/specialistMessagesUtils";
import { getInitials } from "./utils/specialistScheduleUtils";
import "../shared-dashboard/styles/dashboardTokens.css";
import "./styles/specialistDashboardSections.css";

const MOBILE_CHAT_BREAKPOINT = 900;
const THREAD_SCROLL_THRESHOLD_PX = 80;

export default function SpecialistMessagesPage() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const pageLabels = useMemo(() => getSpecialistMessagesPageLabels(t), [t]);
  const emptyMessages = useMemo(() => getSpecialistMessagesEmptyMessages(t), [t]);
  const mapperContext = useMemo(() => ({ t, locale }), [t, locale]);
  const { conversationId: routeConversationId } = useParams();
  const { user, isInitializing } = useAuth();
  const specialistUserId = isInitializing ? null : user?.id ?? null;

  const [composerValue, setComposerValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowsChat, setMobileShowsChat] = useState(Boolean(routeConversationId));
  const [isNarrowLayout, setIsNarrowLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_CHAT_BREAKPOINT : false,
  );
  const [resolvedConversation, setResolvedConversation] = useState(null);
  const threadScrollRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

  const {
    specialist,
    badges,
    sidebarCollapsed,
    mobileNavOpen,
    notificationsOpen,
    toast,
    navItems,
    notifications,
    isLoadingNotifications,
    notificationsError,
    unreadCount,
    setSidebarCollapsed,
    setMobileNavOpen,
    setNotificationsOpen,
    showToast,
    handleSignOut,
    handleViewProfile,
    handleMessages,
    handleViewAllNotifications,
    handleNotificationSelect,
    handleSidebarNav,
    refetchNotifications,
    markConversationNotificationsRead,
  } = useSpecialistShell(specialistUserId);

  const {
    conversations,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useSpecialistConversations(specialistUserId);

  const activeConversationId = routeConversationId || null;

  const listConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const activeConversation = useMemo(() => {
    if (listConversation) {
      return listConversation;
    }

    if (resolvedConversation?.id === activeConversationId) {
      return applySpecialistConversationLocalization(resolvedConversation, mapperContext);
    }

    return null;
  }, [listConversation, resolvedConversation, activeConversationId, mapperContext]);
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
  } = useSpecialistChatThread(activeConversationId, specialistUserId, {
    enabled: Boolean(activeConversationId),
    onIncomingMessages: handleIncomingMessages,
  });

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
  } = useSpecialistMessageComposer({
    conversationId: activeConversationId,
    onSendSuccess: handleSendSuccess,
    setSendingState,
  });

  const attachmentDraft = useSpecialistMessageAttachmentDraft();
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

  const parentPresence = useSpecialistPresence(activeConversation?.parentId ?? null);

  const filteredConversations = useMemo(
    () => filterSpecialistConversations(conversations, searchQuery),
    [conversations, searchQuery],
  );

  const threadItems = useMemo(
    () => buildLocalizedMessageThreadItems(messages, mapperContext),
    [messages, mapperContext],
  );

  const latestReadOutgoingId = useMemo(
    () => getLatestReadOutgoingMessageId(messages, specialistUserId),
    [messages, specialistUserId],
  );

  const navigateToConversation = useCallback((conversationId) => {
    clearDraft();
    cancelRecording();
    navigate(buildSpecialistMessagesPath(conversationId));
    if (isNarrowLayout) {
      setMobileShowsChat(Boolean(conversationId));
    }
  }, [cancelRecording, clearDraft, navigate, isNarrowLayout]);

  const navigateToMessagesList = useCallback(() => {
    clearDraft();
    cancelRecording();
    navigate(SPECIALIST_WEB_ROUTES.messages);
    if (isNarrowLayout) {
      setMobileShowsChat(false);
    }
  }, [cancelRecording, clearDraft, navigate, isNarrowLayout]);

  useEffect(() => {
    if (!activeConversationId || listConversation) {
      return undefined;
    }

    let cancelled = false;

    async function loadConversation() {
      try {
        const row = await getConversation(activeConversationId);
        if (!cancelled && row) {
          setResolvedConversation(mapSpecialistConversation(row));
        }
      } catch {
        if (!cancelled) {
          setResolvedConversation(null);
        }
      }
    }

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, listConversation]);

  useEffect(() => {
    if (!activeConversationId) {
      return undefined;
    }

    markConversationNotificationsRead(activeConversationId);
  }, [activeConversationId, markConversationNotificationsRead]);

  useEffect(() => {
    if (!routeConversationId && specialistUserId) {
      refetchConversations();
      refetchNotifications();
    }
  }, [routeConversationId, specialistUserId, refetchConversations, refetchNotifications]);

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
  }, [activeConversationId, setMobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return undefined;
    }

    document.body.classList.add("pd-preview-drawer-open");
    return () => document.body.classList.remove("pd-preview-drawer-open");
  }, [mobileNavOpen]);

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
      return <p className="pd-inline-loading">{pageLabels.loadingConversations}</p>;
    }

    if (conversationsError) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-error">{conversationsError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchConversations}>
            {pageLabels.retry}
          </button>
        </div>
      );
    }

    if (conversations.length === 0) {
      return <p className="pd-section-sub">{emptyMessages.conversations}</p>;
    }

    if (filteredConversations.length === 0) {
      return <p className="pd-section-sub">{emptyMessages.filtered}</p>;
    }
    return (
      <div className="pd-messages-list">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={`pd-messages-list-item pd-specialist-conversation-item${
              conversation.id === activeConversationId ? " is-active" : ""
            }`}
            onClick={() => navigateToConversation(conversation.id)}
          >
            <span
              className="pd-avatar pd-specialist-conversation-avatar pd-specialist-conversation-avatar-icon"
              aria-hidden="true"
            >
              <img
                src={familyRestroomIcon}
                alt=""
                className="pd-specialist-conversation-avatar-image"
              />
            </span>
            <span className="pd-specialist-conversation-copy">
              <strong dir="auto">{conversation.title}</strong>
              {conversation.subtitle ? <span dir="auto">{conversation.subtitle}</span> : null}
              {conversation.startedLabel ? (
                <span className="pd-specialist-conversation-meta">{conversation.startedLabel}</span>
              ) : null}
            </span>
            <ChevronRight size={16} aria-hidden="true" className="pd-specialist-conversation-chevron" />
          </button>
        ))}
      </div>
    );
  };

  const renderThread = () => {
    if (!activeConversationId) {
      return <p className="pd-section-sub">{pageLabels.selectConversation}</p>;
    }

    if (isLoadingMessages) {
      return <p className="pd-inline-loading">{pageLabels.loadingMessages}</p>;
    }

    if (messagesError) {
      return (
        <div className="pd-ai-panel-state">
          <p className="pd-inline-error">{messagesError}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={refetchMessages}>
            {pageLabels.retry}
          </button>
        </div>
      );
    }

    if (threadItems.length === 0) {
      return <p className="pd-section-sub">{emptyMessages.chat}</p>;
    }
    return threadItems.map((item) => {
      if (item.type === "separator") {
        return (
          <div key={item.key} className="pd-message-day-separator">
            <span>{item.label}</span>
          </div>
        );
      }

      const message = item.message;
      const isOwn = message.senderId === specialistUserId;
      const showSeen = isOwn && message.id === latestReadOutgoingId;

      return (
        <div
          key={item.key}
          className={`pd-message-block${isOwn ? " is-own" : " is-other"}`}
        >
          <article
            className={`pd-message-bubble${isOwn ? " is-own" : " is-other"}`}
          >
            {!isOwn && message.senderName ? (
              <span className="pd-message-sender" dir="auto">
                {message.senderName}
              </span>
            ) : null}
            {message.content ? (
              <p dir="auto">
                {localizeSpecialistMessageContent(message.content, t)}
              </p>
            ) : null}
            {message.hasAttachments ? (
              <div className="pd-message-attachments">
                {message.attachments.map((attachment) => (
                  <SpecialistMessageAttachmentDisplay
                    key={attachment.id || attachment.fileUrl}
                    attachment={attachment}
                  />
                ))}
              </div>
            ) : null}
            {message.sentAt ? (
              <time className="pd-message-time">{message.timeLabel}</time>
            ) : null}
          </article>
          {showSeen ? <span className="pd-message-seen">Seen</span> : null}
        </div>
      );
    });
  };

  return (
    <div className="pd-preview">
      <SpecialistDashboardShell
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        navItems={navItems}
        badges={badges}
        user={specialist}
        notifications={notifications}
        notificationsOpen={notificationsOpen}
        onNotificationsOpenChange={setNotificationsOpen}
        notificationsLoading={isLoadingNotifications}
        notificationsError={notificationsError}
        notificationBadgeCount={unreadCount}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavAction={handleSidebarNav}
        onSignOut={handleSignOut}
        onViewProfile={handleViewProfile}
        onMessages={handleMessages}
        onViewAllNotifications={handleViewAllNotifications}
        onNotificationSelect={handleNotificationSelect}
        showToast={showToast}
      >
        <div className="pd-task-hub-page pd-messages-page">
          <div className="pd-task-hub-toolbar">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={() => navigate(SPECIALIST_WEB_ROUTES.dashboard)}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {pageLabels.backToDashboard}
            </button>
            {isNarrowLayout && mobileShowsChat ? (
              <button
                type="button"
                className="pd-btn pd-btn-soft"
                onClick={navigateToMessagesList}
              >
                {pageLabels.conversations}
              </button>
            ) : null}
          </div>

          <header className="pd-task-hub-header">
            <h1 className="pd-task-hub-title">{pageLabels.title}</h1>
            <p className="pd-task-hub-subtitle">
              {pageLabels.subtitle}
            </p>
          </header>

          <div className="pd-messages-layout">
            {showListPanel ? (
              <aside className="pd-messages-sidebar pd-card pd-card-pad">
                <h2 className="pd-section-title">{pageLabels.conversations}</h2>
                {conversations.length > 0 ? (
                  <label className="pd-specialist-conversation-search">
                    <span className="pd-visually-hidden">{pageLabels.searchLabel}</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={pageLabels.searchPlaceholder}
                      className="pd-specialist-conversation-search-input"
                    />
                  </label>
                ) : null}
                <div className="pd-messages-list-scroll">
                  {renderConversationList()}
                </div>
              </aside>
            ) : null}

            {showChatPanel ? (
              <section className="pd-messages-chat pd-card pd-card-pad">
                <div className="pd-messages-chat-header pd-specialist-chat-header">
                  {activeConversation ? (
                    <div className="pd-specialist-chat-header-main">
                      <UserProfileAvatar
                        imageUrl={null}
                        initials={getInitials(activeConversation.parentName, "P")}
                        alt=""
                        shellClassName="pd-avatar pd-specialist-chat-header-avatar"
                        fallbackClassName="pd-avatar pd-specialist-chat-header-avatar"
                        className="pd-avatar-photo"
                      />
                      <div>
                        <h2 className="pd-section-title" dir="auto">{activeConversation.title}</h2>
                        {activeConversation.subtitle ? (
                          <p className="pd-section-sub" dir="auto">{activeConversation.subtitle}</p>
                        ) : null}
                        <SpecialistPresenceStatus
                          presence={parentPresence.presence}
                          isOnline={parentPresence.isOnline}
                          label={parentPresence.label}
                          isLoading={parentPresence.isLoading}
                        />
                      </div>
                    </div>
                  ) : (
                    <h2 className="pd-section-title">{pageLabels.conversationDefault}</h2>
                  )}
                </div>

                <div
                  ref={threadScrollRef}
                  className="pd-messages-thread"
                  onScroll={handleThreadScroll}
                >
                  {renderThread()}
                </div>

                {activeConversationId ? (
                  <SpecialistMessagesComposer
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
      </SpecialistDashboardShell>

      {toast ? (
        <div className="pd-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
