import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../../case_intake/models/case_intake_request_model.dart';
import '../../case_intake/providers/parent_case_intake_provider.dart';
import '../../case_intake/utils/case_request_selection.dart';
import '../../case_intake/widgets/parent_dashboard_case_intake_section.dart';
import '../models/communication_models.dart';
import '../models/parent_dashboard_models.dart';
import '../providers/parent_dashboard_provider.dart';
import '../providers/parent_features_provider.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_chat_bubble.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_scaffold.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/dashboard_visuals.dart';
import '../widgets/parent_dashboard_cards.dart';
import '../widgets/parent_navigation.dart';
import 'parent/parent_ui_helpers.dart';

class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  ConsumerState<ParentDashboardScreen> createState() =>
      _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends ConsumerState<ParentDashboardScreen>
    with WidgetsBindingObserver {
  bool _hadNoChildrenOnLastRefresh = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initialLoad();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _refreshDashboardDomains(preferConvertedChild: true);
    }
  }

  Future<void> _initialLoad() async {
    _hadNoChildrenOnLastRefresh = ref
        .read(parentDashboardProvider)
        .children
        .isEmpty;
    await Future.wait([
      ref.read(parentDashboardProvider.notifier).initialize(),
      ref.read(parentCaseIntakeProvider.notifier).loadRequests(),
      ref.read(parentNotificationsProvider.notifier).initialize(),
    ]);
    await _applyConvertedChildPreference();
  }

  Future<void> _refreshDashboardDomains({
    bool preferConvertedChild = true,
  }) async {
    final previouslyHadNoChildren = ref
        .read(parentDashboardProvider)
        .children
        .isEmpty;
    _hadNoChildrenOnLastRefresh = previouslyHadNoChildren;

    await Future.wait([
      ref.read(parentDashboardProvider.notifier).refresh(),
      ref.read(parentCaseIntakeProvider.notifier).refreshRequests(),
    ]);

    if (preferConvertedChild) {
      await _applyConvertedChildPreference(
        previouslyHadNoChildren: previouslyHadNoChildren,
      );
    }
  }

  Future<void> _applyConvertedChildPreference({
    bool? previouslyHadNoChildren,
  }) async {
    final hadNoChildren =
        previouslyHadNoChildren ?? _hadNoChildrenOnLastRefresh;
    final dashboard = ref.read(parentDashboardProvider);
    final caseState = ref.read(parentCaseIntakeProvider);
    final preferred = preferredConvertedPatientId(
      requests: caseState.requests,
      linkedChildIds: dashboard.children.map((child) => child.id),
      previouslyHadNoChildren: hadNoChildren,
    );
    if (preferred == null) {
      return;
    }

    final exists = dashboard.children.any((child) => child.id == preferred);
    if (!exists) {
      return;
    }

    if (!hadNoChildren &&
        dashboard.selectedChildId != null &&
        dashboard.selectedChildId!.isNotEmpty &&
        dashboard.selectedChildId != preferred) {
      // Preserve an existing deliberate child selection when the parent
      // already had children before this refresh.
      return;
    }

    if (dashboard.selectedChildId == preferred) {
      return;
    }

    await ref.read(parentDashboardProvider.notifier).selectChild(preferred);
  }

  Future<void> _pushAndRefresh(String location, {Object? extra}) async {
    await context.push(location, extra: extra);
    if (!mounted) {
      return;
    }
    await _refreshDashboardDomains(preferConvertedChild: true);
  }

  void _onNotificationsTap() {
    _pushAndRefresh(AppRoutes.parentNotifications);
  }

  void _onAvatarTap() {
    _pushAndRefresh(AppRoutes.parentProfile);
  }

  void _handleNextAction(ParentNextAction action) {
    final state = ref.read(parentDashboardProvider);
    switch (action.type) {
      case ParentNextActionType.startExercise:
        if (state.selectedChild == null || state.dailyTasks.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No exercises assigned today.')),
          );
          return;
        }
        _pushAndRefresh(AppRoutes.parentDailyTasks);
      case ParentNextActionType.reviewFeedback:
        _pushAndRefresh(AppRoutes.parentFeedback);
      case ParentNextActionType.viewReport:
        _pushAndRefresh(AppRoutes.parentReports);
    }
  }

  void _openExercise(ParentDailyTask task) {
    final childId = ref.read(parentDashboardProvider).selectedChildId;
    if (childId != null) {
      ref.read(parentExercisesProvider.notifier).loadForChild(childId);
    }
    _pushAndRefresh(
      '${AppRoutes.parentExerciseDetails}?assignedExerciseId=${Uri.encodeComponent(task.id)}',
    );
  }

  void _openProgress() {
    final childId = ref.read(parentDashboardProvider).selectedChildId;
    if (childId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select a child to view progress.')),
      );
      return;
    }
    _pushAndRefresh(
      '${AppRoutes.parentProgress}?childId=${Uri.encodeComponent(childId)}',
    );
  }

  void _openAiChat() {
    _pushAndRefresh(AppRoutes.parentAiChat);
  }

  void _openMessages() {
    _pushAndRefresh(AppRoutes.parentMessages);
  }

  void _onChildrenCardTap() {
    _pushAndRefresh(AppRoutes.parentChildren);
  }

  void _onTasksCardTap() {
    _pushAndRefresh(AppRoutes.parentDailyTasks);
  }

  void _onSessionsCardTap() {
    _pushAndRefresh(AppRoutes.parentSessions);
  }

  void _onLatestReportCardTap(ParentDashboardState state) {
    final label = state.overview.latestReportLabel;
    final hasReport =
        label.isNotEmpty && label != 'No report yet' && label != '—';
    if (!hasReport && state.reports.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No reports available yet.')),
      );
      return;
    }
    _pushAndRefresh(AppRoutes.parentReports);
  }

  Future<void> _openCaseRequest(CaseIntakeRequest request) {
    return _pushAndRefresh(AppRoutes.parentCaseRequestDetail(request.id));
  }

  Future<void> _openCaseConversation(CaseIntakeRequest request) async {
    final conversationId = request.conversationId;
    if (conversationId == null || conversationId.isEmpty) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Conversation is not available yet.')),
      );
      return;
    }

    final conversation = CommunicationConversation(
      id: conversationId,
      patientId: request.patientId,
      parentId: request.parentId,
      specialistId: request.assignedSpecialistId ?? '',
      specialistName: request.assignedSpecialist?.fullName,
      patientName: request.childName,
      caseRequestId: request.id,
      caseRequestChildName: request.childName,
    );

    await _pushAndRefresh(
      AppRoutes.parentChat(conversationId),
      extra: conversation,
    );
  }

  String _latestReportTitle(ParentDashboardState state) {
    final label = state.overview.latestReportLabel;
    if (label.isEmpty || label == 'No report yet') {
      return '—';
    }
    return label;
  }

  IconData _taskIcon(String title) {
    final lower = title.toLowerCase();
    if (lower.contains('speech') || lower.contains('pronunciation')) {
      return Icons.mic_none_rounded;
    }
    if (lower.contains('motor') || lower.contains('hand')) {
      return Icons.back_hand_outlined;
    }
    if (lower.contains('balance')) {
      return Icons.accessibility_new_rounded;
    }
    return Icons.fitness_center_outlined;
  }

  Color _taskColor(int index) {
    const colors = [
      DashboardColors.primary,
      DashboardColors.accent,
      Color(0xFF3B82F6),
      DashboardColors.warning,
    ];
    return colors[index % colors.length];
  }

  Color _progressColor(int index) {
    const colors = [
      Color(0xFF3B82F6),
      DashboardColors.accent,
      DashboardColors.warning,
      DashboardColors.primary,
    ];
    return colors[index % colors.length];
  }

  String _formatDate(DateTime? date) {
    if (date == null) {
      return 'Recently';
    }
    return DateFormat('MMM d, yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentDashboardProvider);
    final caseIntakeState = ref.watch(parentCaseIntakeProvider);
    final auth = ref.watch(authProvider);
    final notifications = ref.watch(parentNotificationsProvider);
    final unreadMessageCount = notifications.unreadMessageCount;
    final profileImageUrl = auth.user?.profileImageUrl;
    final displayName = auth.user?.fullName ?? state.user?.fullName;
    final theme = Theme.of(context);
    final userName = dashboardDisplayName(displayName);
    final selectedChild = state.selectedChild;
    final avatarInitials = dashboardInitials(displayName);
    final featuredRequest = selectFeaturedCaseRequest(
      requests: caseIntakeState.requests,
      linkedChildIds: state.children.map((child) => child.id),
    );

    if (state.isLoading) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        notificationCount: state.unreadNotifications,
        currentNav: DashboardNavItem.home,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: const DashboardLoadingCard(),
      );
    }

    if (state.errorMessage != null && !state.hasAuth) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        currentNav: DashboardNavItem.home,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: () => context.go(AppRoutes.login),
        ),
      );
    }

    return DashboardScaffold(
      avatarInitials: avatarInitials,
      avatarImageUrl: profileImageUrl,
      notificationCount: state.unreadNotifications,
      currentNav: DashboardNavItem.home,
      onNavTap: (item) => ParentNavigation.onNavTap(context, item),
      onNotificationsTap: _onNotificationsTap,
      onAvatarTap: _onAvatarTap,
      scrollBody: false,
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          DashboardChatBubble(
            unreadCount: unreadMessageCount,
            onTap: _openMessages,
          ),
          const SizedBox(height: 12),
          FloatingActionButton(
            onPressed: _openAiChat,
            backgroundColor: DashboardColors.primary,
            foregroundColor: Colors.white,
            tooltip: 'AI Assistant',
            child: const Icon(Icons.smart_toy_outlined),
          ),
        ],
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      body: RefreshIndicator(
        onRefresh: () => _refreshDashboardDomains(preferConvertedChild: true),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DashboardGreeting(message: 'Welcome back, $userName'),
              SizedBox(height: context.dashSpacing * 0.75),
              if (state.children.isEmpty)
                ParentDashboardCaseIntakeSection(
                  hasLinkedChildren: false,
                  caseIntakeState: caseIntakeState,
                  featuredRequest: featuredRequest,
                  onRetry: () => ref
                      .read(parentCaseIntakeProvider.notifier)
                      .loadRequests(),
                  onSubmitNewRequest: () =>
                      _pushAndRefresh(AppRoutes.parentCaseRequestNew),
                  onViewAllRequests: () =>
                      _pushAndRefresh(AppRoutes.parentCaseRequests),
                  onViewRequest: _openCaseRequest,
                  onOpenConversation: _openCaseConversation,
                  onSubmitAnotherRequest: () =>
                      _pushAndRefresh(AppRoutes.parentCaseRequestNew),
                )
              else ...[
                ParentChildSwitcher(
                  children: state.children,
                  selectedChildId: state.selectedChildId,
                  onSelected: (childId) {
                    ref
                        .read(parentDashboardProvider.notifier)
                        .selectChild(childId);
                  },
                ),
                if (featuredRequest != null ||
                    caseIntakeState.isLoading ||
                    (caseIntakeState.errorMessage != null &&
                        caseIntakeState.requests.isEmpty)) ...[
                  SizedBox(height: context.dashSpacing * 0.75),
                  ParentDashboardCaseIntakeSection(
                    hasLinkedChildren: true,
                    caseIntakeState: caseIntakeState,
                    featuredRequest: featuredRequest,
                    onRetry: () => ref
                        .read(parentCaseIntakeProvider.notifier)
                        .loadRequests(),
                    onSubmitNewRequest: () =>
                        _pushAndRefresh(AppRoutes.parentCaseRequestNew),
                    onViewAllRequests: () =>
                        _pushAndRefresh(AppRoutes.parentCaseRequests),
                    onViewRequest: _openCaseRequest,
                    onOpenConversation: _openCaseConversation,
                    onSubmitAnotherRequest: () =>
                        _pushAndRefresh(AppRoutes.parentCaseRequestNew),
                  ),
                ],
              ],
              if (state.errorMessage != null) ...[
                SizedBox(height: context.dashSpacing * 0.75),
                DashboardErrorCard(
                  message: state.errorMessage!,
                  onRetry: () => _refreshDashboardDomains(),
                ),
              ],
              SizedBox(height: context.dashSpacing),
              DashboardSummaryGrid(
                childAspectRatio: 1.12,
                cards: [
                  DashboardSummaryCard(
                    label: 'Children',
                    value: '${state.overview.childrenCount}',
                    icon: Icons.family_restroom_outlined,
                    iconBackground: DashboardColors.purpleSoft,
                    iconColor: DashboardColors.primary,
                    onTap: _onChildrenCardTap,
                  ),
                  DashboardSummaryCard(
                    label: "Today's Tasks",
                    value:
                        '${state.streakInfo.totalToday > 0 ? state.streakInfo.totalToday : state.overview.todaysTasksCount}',
                    icon: Icons.task_alt_outlined,
                    iconBackground: DashboardColors.tealSoft,
                    iconColor: DashboardColors.accent,
                    onTap: _onTasksCardTap,
                  ),
                  DashboardSummaryCard(
                    label: 'Upcoming Sessions',
                    value: '${state.overview.upcomingSessionsCount}',
                    icon: Icons.event_outlined,
                    iconBackground: DashboardColors.blueSoft,
                    iconColor: const Color(0xFF3B82F6),
                    onTap: _onSessionsCardTap,
                  ),
                  DashboardSummaryCard(
                    label: 'Latest Report',
                    value: _latestReportTitle(state),
                    valueMaxLines: 2,
                    valueStyle: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.textPrimary,
                      height: 1.25,
                    ),
                    icon: Icons.insights_outlined,
                    iconBackground: DashboardColors.amberSoft,
                    iconColor: DashboardColors.warning,
                    onTap: () => _onLatestReportCardTap(state),
                  ),
                ],
              ),
              SizedBox(height: context.dashSpacing),
              if (state.isLoadingChild)
                const DashboardLoadingCard(
                  message: 'Updating child insights...',
                )
              else if (state.children.isNotEmpty) ...[
                if (state.aiInsight != null) ...[
                  ParentAiInsightCard(insight: state.aiInsight!),
                  SizedBox(height: context.dashSpacing * 0.75),
                ],
                ParentStreakCard(streakInfo: state.streakInfo),
                SizedBox(height: context.dashSpacing * 0.75),
                if (state.attentionAlert != null) ...[
                  ParentAttentionAlertCard(alert: state.attentionAlert!),
                  SizedBox(height: context.dashSpacing * 0.75),
                ],
                ParentNextActionButton(
                  action: state.nextAction,
                  onPressed: () => _handleNextAction(state.nextAction),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                if (state.latestFeedback != null) ...[
                  ParentFeedbackCard(feedback: state.latestFeedback!),
                  SizedBox(height: context.dashSpacing * 0.75),
                ],
                if (state.speechSummary != null &&
                    state.speechSummary!.overallScore != null) ...[
                  ParentSpeechAnalysisCard(summary: state.speechSummary!),
                  SizedBox(height: context.dashSpacing * 0.75),
                ],
              ],
              SizedBox(height: context.dashSpacing * 0.5),
              DashboardSectionHeader(
                title: "Today's Tasks",
                onActionTap: () => _pushAndRefresh(AppRoutes.parentDailyTasks),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              if (state.dailyTasks.isEmpty)
                DashboardEmptyCard(
                  message: state.children.isEmpty
                      ? 'Daily tasks will appear after the child profile is created and a specialist assigns exercises.'
                      : selectedChild == null
                      ? 'Select a child to view today\'s tasks.'
                      : 'No tasks assigned for ${selectedChild.name} today.',
                )
              else
                ...state.dailyTasks.asMap().entries.map((entry) {
                  final index = entry.key;
                  final task = entry.value;
                  return Padding(
                    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                    child: DashboardSurfaceCard(
                      onTap: () => _openExercise(task),
                      child: Row(
                        children: [
                          Container(
                            padding: EdgeInsets.all(context.dashSpacing * 0.45),
                            decoration: BoxDecoration(
                              color: _taskColor(index).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              task.isCompleted
                                  ? Icons.check_circle_outline_rounded
                                  : _taskIcon(task.title),
                              color: _taskColor(index),
                              size: context.dashSpacing * 0.55,
                            ),
                          ),
                          SizedBox(width: context.dashSpacing * 0.65),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  task.title,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: DashboardColors.textPrimary,
                                  ),
                                ),
                                SizedBox(height: context.dashSpacing * 0.15),
                                Text(
                                  [
                                    if (selectedChild != null)
                                      selectedChild.name,
                                    if (task.dueTime != null) task.dueTime,
                                  ].join(' • '),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.chevron_right_rounded,
                            color: DashboardColors.textMuted,
                            size: context.dashSpacing * 0.55,
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              SizedBox(height: context.dashSpacing * 0.6),
              DashboardSectionHeader(
                title: 'Child Progress',
                onActionTap: _openProgress,
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              if (state.childrenProgress.isEmpty)
                const DashboardEmptyCard(
                  message:
                      'Progress data will appear once exercises are tracked.',
                )
              else
                DashboardSurfaceCard(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      for (var i = 0; i < state.childrenProgress.length; i++)
                        if (state.childrenProgress[i].name.trim().isNotEmpty)
                          DashboardProgressRing(
                            label: state.childrenProgress[i].name,
                            progress: _normalizeProgress(
                              state.childrenProgress[i].progressPercent,
                            ),
                            color: _progressColor(i),
                          ),
                    ],
                  ),
                ),
              SizedBox(height: context.dashSpacing * 1.2),
              ParentAiAssistantCard(onTap: _openAiChat),
              SizedBox(height: context.dashSpacing * 1.2),
              DashboardSectionHeader(
                title: 'Recent Reports',
                onActionTap: () => _pushAndRefresh(AppRoutes.parentReports),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              if (state.reports.isEmpty)
                const DashboardEmptyCard(
                  message: 'No reports available yet for the selected child.',
                )
              else
                ...state.reports
                    .take(3)
                    .map(
                      (report) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.6,
                        ),
                        child: DashboardSurfaceCard(
                          onTap:
                              report.pdfUrl != null && report.pdfUrl!.isNotEmpty
                              ? () =>
                                    parentOpenReportUrl(context, report.pdfUrl)
                              : null,
                          onLongPress:
                              report.pdfUrl != null && report.pdfUrl!.isNotEmpty
                              ? () => parentLongPressReportUrl(
                                  context,
                                  report.pdfUrl,
                                )
                              : null,
                          child: Row(
                            children: [
                              Container(
                                padding: EdgeInsets.all(
                                  context.dashSpacing * 0.5,
                                ),
                                decoration: BoxDecoration(
                                  color: DashboardColors.purpleSoft,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.description_outlined,
                                  color: DashboardColors.primary,
                                  size: context.dashSpacing * 0.6,
                                ),
                              ),
                              SizedBox(width: context.dashSpacing * 0.65),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      report.title,
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: DashboardColors.textPrimary,
                                          ),
                                    ),
                                    SizedBox(
                                      height: context.dashSpacing * 0.15,
                                    ),
                                    Text(
                                      [
                                        if (report.summary != null)
                                          report.summary,
                                        _formatDate(report.date),
                                      ].whereType<String>().join(' • '),
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color:
                                                DashboardColors.textSecondary,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                onPressed:
                                    report.pdfUrl != null &&
                                        report.pdfUrl!.isNotEmpty
                                    ? () => parentOpenReportUrl(
                                        context,
                                        report.pdfUrl,
                                      )
                                    : null,
                                tooltip: 'Open report',
                                icon: Icon(
                                  Icons.open_in_new_outlined,
                                  color: DashboardColors.primary,
                                  size: context.dashSpacing * 0.6,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
              SizedBox(height: context.dashSpacing),
            ],
          ),
        ),
      ),
    );
  }

  double _normalizeProgress(double? value) {
    if (value == null) {
      return 0;
    }
    if (value <= 1) {
      return value.clamp(0, 1);
    }
    return (value / 100).clamp(0, 1);
  }
}
