import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useLocale } from "../../context/useLocale.js";
import {
  PARENT_WEB_ROUTES,
  buildParentAiAssistantPath,
} from "../../routes/parentDashboardRoutes";
import { ParentDashboardShell } from "./layout/ParentDashboardShell";
import { AiChildSelector } from "./components/ai-assistant/AiChildSelector";
import { AiChatPanel } from "./components/ai-assistant/AiChatPanel";
import { AiConversationList } from "./components/ai-assistant/AiConversationList";
import { AiEmptyState } from "./components/ai-assistant/AiEmptyState";
import { AiErrorState } from "./components/ai-assistant/AiErrorState";
import { useParentAiComposer } from "./hooks/useParentAiComposer";
import { useParentAiConversation } from "./hooks/useParentAiConversation";
import { useParentAiConversations } from "./hooks/useParentAiConversations";
import { useParentNotifications } from "./hooks/useParentNotifications";
import { useParentDashboardNavigation } from "./hooks/useParentDashboardNavigation";
import { mapParentFromAuth } from "./utils/parentDashboardMappers";
import {
  getAiEmptyMessages,
  getConversationPatientId,
} from "./utils/parentAiAssistantUtils";
import "./styles/parentDashboardTokens.css";

const MOBILE_CHAT_BREAKPOINT = 900;

export default function ParentAiAssistantPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId: routeConversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const { user, isInitializing } = useAuth();
  const parentUserId = isInitializing ? null : user?.id ?? null;

  const [selectedChildId, setSelectedChildId] = useState(null);
  const [composerValue, setComposerValue] = useState("");
  const [mobileShowsChat, setMobileShowsChat] = useState(Boolean(routeConversationId));
  const [isNarrowLayout, setIsNarrowLayout] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_CHAT_BREAKPOINT : false,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const parent = useMemo(() => mapParentFromAuth(user), [user]);

  const requestedChildId = useMemo(() => {
    if (selectedChildId) {
      return selectedChildId;
    }

    const fromQuery = searchParams.get("childId")?.trim();
    if (fromQuery) {
      return fromQuery;
    }

    return location.state?.selectedChildId ?? null;
  }, [selectedChildId, searchParams, location.state]);

  const {
    children,
    conversations,
    childNameByPatientId,
    validChildId,
    isLoadingChildren,
    isLoadingConversations,
    isCreatingConversation,
    childrenError,
    conversationsError,
    refetchConversations,
    createConversation,
    upsertConversation,
  } = useParentAiConversations(parentUserId, requestedChildId);

  const activeConversationId = routeConversationId || null;

  const {
    messages,
    isLoadingMessages,
    messagesError,
    refetchMessages,
    appendMessages,
  } = useParentAiConversation(activeConversationId, validChildId);

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
    selectedChildId: validChildId,
    exercises: [],
    upcomingSession: null,
    latestReport: null,
    markNotificationRead,
    showToast,
    closeMobileNav,
  });

  const navigateToConversation = useCallback((conversationId, childId = validChildId) => {
    const path = buildParentAiAssistantPath(childId, conversationId);
    navigate(path);
    if (isNarrowLayout) {
      setMobileShowsChat(Boolean(conversationId));
    }
  }, [navigate, validChildId, isNarrowLayout]);

  const handleSendSuccess = useCallback((mapped) => {
    if (mapped.userMessage) {
      appendMessages(mapped.userMessage);
    }
    if (mapped.botMessage) {
      appendMessages(mapped.botMessage);
    }
    if (mapped.conversation) {
      upsertConversation({
        ...mapped.conversation,
        patientId: validChildId,
        childName: childNameByPatientId[validChildId] ?? null,
      });
    }

    const nextConversationId = mapped.conversation?.id || activeConversationId;
    if (nextConversationId && nextConversationId !== activeConversationId) {
      navigateToConversation(nextConversationId);
    } else {
      refetchConversations();
    }
  }, [
    activeConversationId,
    appendMessages,
    childNameByPatientId,
    navigateToConversation,
    refetchConversations,
    upsertConversation,
    validChildId,
  ]);

  const {
    isSending,
    sendError,
    sendMessage,
    clearSendError,
  } = useParentAiComposer({
    conversationId: activeConversationId,
    patientId: validChildId,
    childNameByPatientId,
    onSendSuccess: handleSendSuccess,
  });

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

  useEffect(() => {
    if (!validChildId) {
      return;
    }

    const queryChildId = searchParams.get("childId")?.trim();
    if (queryChildId === validChildId) {
      return;
    }

    const path = buildParentAiAssistantPath(validChildId, activeConversationId);
    navigate(path, { replace: true });
  }, [validChildId, searchParams, activeConversationId, navigate]);

  useEffect(() => {
    if (!validChildId || !activeConversationId) {
      return;
    }

    const belongsToChild = conversations.some((item) => item.id === activeConversationId);
    const storedPatientId = getConversationPatientId(activeConversationId);
    if (!belongsToChild && storedPatientId && storedPatientId !== validChildId) {
      navigate(buildParentAiAssistantPath(validChildId), { replace: true });
    }
  }, [validChildId, activeConversationId, conversations, navigate]);

  const handleBack = useCallback(() => {
    navigate(PARENT_WEB_ROUTES.dashboard, {
      state: validChildId ? { selectedChildId: validChildId } : undefined,
    });
  }, [navigate, validChildId]);

  const handleChildSelect = useCallback((childId) => {
    setSelectedChildId(childId);
    navigate(buildParentAiAssistantPath(childId));
    setMobileShowsChat(false);
  }, [navigate]);

  const handleConversationSelect = useCallback((conversationId) => {
    navigateToConversation(conversationId);
  }, [navigateToConversation]);

  const handleCreateConversation = useCallback(async () => {
    const created = await createConversation();
    if (created?.id) {
      navigateToConversation(created.id);
    }
  }, [createConversation, navigateToConversation]);

  const handleSend = useCallback(async (content) => {
    clearSendError();
    const result = await sendMessage(content);
    if (result.ok) {
      setComposerValue("");
      return;
    }

    if (result.reason === "error") {
      setComposerValue(result.content ?? content);
    }
  }, [clearSendError, sendMessage]);

  const handleBackToList = useCallback(() => {
    setMobileShowsChat(false);
    navigate(buildParentAiAssistantPath(validChildId));
  }, [navigate, validChildId]);

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

  const chatDisabled = !validChildId;

  const aiEmptyMessages = useMemo(() => getAiEmptyMessages(t), [t]);

  const renderWorkspace = () => {
    if (isLoadingChildren) {
      return (
        <section className="pd-card pd-card-pad pd-ai-state pd-section-enter">
          <p className="pd-inline-loading">{t("parent.aiAssistant.loadingChildren")}</p>
        </section>
      );
    }

    if (childrenError) {
      return <AiErrorState message={childrenError} />;
    }

    if (!validChildId) {
      return (
        <AiEmptyState
          message={aiEmptyMessages.noChild}
          action={(
            <AiChildSelector
              children={children}
              selectedChildId={requestedChildId}
              isLoading={isLoadingChildren}
              onSelect={handleChildSelect}
            />
          )}
        />
      );
    }

    const showList = !isNarrowLayout || !mobileShowsChat;
    const showChat = !isNarrowLayout || mobileShowsChat;

    return (
      <div className="pd-ai-workspace">
        {showList ? (
          <AiConversationList
            conversations={conversations}
            selectedConversationId={activeConversationId}
            isLoading={isLoadingConversations}
            error={conversationsError}
            isCreating={isCreatingConversation}
            onSelect={handleConversationSelect}
            onCreate={handleCreateConversation}
            onRetry={refetchConversations}
          />
        ) : null}

        {showChat ? (
          <AiChatPanel
            conversationId={activeConversationId}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            messagesError={messagesError}
            isSending={isSending}
            sendError={sendError}
            composerValue={composerValue}
            onComposerChange={setComposerValue}
            onSend={handleSend}
            onRetryMessages={refetchMessages}
            onBackToList={handleBackToList}
            showBackButton={isNarrowLayout && Boolean(activeConversationId)}
            disabled={chatDisabled}
          />
        ) : null}
      </div>
    );
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
        onSignOut={navigation.handleSignOut}
        onViewProfile={navigation.handleViewProfile}
        onMessages={navigation.handleMessages}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onCloseMobile={closeMobileNav}
        onNavAction={navigation.handleSidebarNav}
      >
        <div className="pd-ai-page pd-section-enter">
          <div className="pd-ai-page-toolbar">
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-back-link"
              onClick={handleBack}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {t("parent.common.backToDashboard")}
            </button>
          </div>

          <header className="pd-ai-page-header">
            <div>
              <h1 className="pd-task-hub-title">{t("parent.aiAssistant.title")}</h1>
              <p className="pd-task-hub-subtitle">
                {t("parent.aiAssistant.subtitle")}
              </p>
            </div>
            {validChildId ? (
              <AiChildSelector
                children={children}
                selectedChildId={validChildId}
                isLoading={isLoadingChildren}
                onSelect={handleChildSelect}
              />
            ) : null}
          </header>

          {renderWorkspace()}
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
