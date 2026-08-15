import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

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
import '../utils/parent_session_display_helpers.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_scaffold.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/parent_dashboard_cards.dart';
import '../widgets/parent_treatment_journey_card.dart';
import '../widgets/parent_navigation.dart';

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
        dashboard.selectedPatientId != null &&
        dashboard.selectedPatientId!.isNotEmpty &&
        dashboard.selectedPatientId != preferred) {
      // Preserve an existing deliberate child selection when the parent
      // already had children before this refresh.
      return;
    }

    if (dashboard.selectedPatientId == preferred) {
      return;
    }

    await ref.read(parentDashboardProvider.notifier).selectPatient(preferred);
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
    final l10n = AppLocalizations.of(context)!;
    switch (action.type) {
      case ParentNextActionType.startExercise:
        if (state.selectedChild == null || state.dailyTasks.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.parentDashboardNoExercisesToday)),
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
    final childId = ref.read(parentDashboardProvider).selectedPatientId;
    if (childId != null) {
      ref.read(parentExercisesProvider.notifier).loadForChild(childId);
    }
    _pushAndRefresh(
      '${AppRoutes.parentExerciseDetails}?assignedExerciseId=${Uri.encodeComponent(task.id)}',
    );
  }

  void _openProgress() {
    final childId = ref.read(parentDashboardProvider).selectedPatientId;
    final l10n = AppLocalizations.of(context)!;
    if (childId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentDashboardSelectChildForProgress)),
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

  void _onTasksCardTap() {
    _pushAndRefresh(AppRoutes.parentDailyTasks);
  }

  void _onSessionsCardTap() {
    _pushAndRefresh(AppRoutes.parentSessions);
  }

  void _onLatestReportCardTap(ParentDashboardState state) {
    final l10n = AppLocalizations.of(context)!;
    final label = state.overview.latestReportLabel;
    final hasReport =
        label.isNotEmpty && label != 'No report yet' && label != '—';
    if (!hasReport && state.reports.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.parentDashboardNoReportsYet)));
      return;
    }
    _pushAndRefresh(AppRoutes.parentReports);
  }

  Future<void> _openCaseRequest(CaseIntakeRequest request) {
    return _pushAndRefresh(AppRoutes.parentCaseRequestDetail(request.id));
  }

  Future<void> _openCaseConversation(CaseIntakeRequest request) async {
    final l10n = AppLocalizations.of(context)!;
    final conversationId = request.conversationId;
    if (conversationId == null || conversationId.isEmpty) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentDashboardConversationUnavailable)),
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
      DashboardColors.brandCyan,
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
      DashboardColors.brandCyan,
    ];
    return colors[index % colors.length];
  }

  void _openChildDetails() {
    final childId = ref.read(parentDashboardProvider).selectedPatientId;
    final l10n = AppLocalizations.of(context)!;
    if (childId == null || childId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentDashboardSelectChildForDetails)),
      );
      return;
    }
    _pushAndRefresh(
      AppRoutes.parentChildDetail.replaceFirst(':childId', childId),
    );
  }

  ParentChild? _progressChildFor(ParentDashboardState state, String patientId) {
    for (final child in state.childrenProgress) {
      if (child.id == patientId) {
        return child;
      }
    }
    for (final child in state.children) {
      if (child.id == patientId) {
        return child;
      }
    }
    return null;
  }

  double _childProgressValue(ParentDashboardState state, String patientId) {
    final progressChild = _progressChildFor(state, patientId);
    return _normalizeProgress(progressChild?.progressPercent);
  }

  String? _heroCategoryLabel(
    ParentChild? selectedChild,
    ParentCaseIntakeState caseIntakeState,
    ParentDashboardState state,
    AppLocalizations l10n,
  ) {
    if (selectedChild == null) {
      return null;
    }
    for (final request in caseIntakeState.requests) {
      if (request.patientId == selectedChild.id &&
          request.category?.name != null &&
          request.category!.name.isNotEmpty) {
        return request.category!.name;
      }
    }
    final insightType = state.aiInsight?.type?.trim();
    if (insightType != null && insightType.isNotEmpty) {
      return insightType.replaceAll('_', ' ');
    }
    if (selectedChild.gender != null &&
        selectedChild.gender!.trim().isNotEmpty) {
      return l10n.parentDashboardRehabilitationFollowUp;
    }
    return l10n.parentDashboardRehabilitationFollowUp;
  }

  String _heroUpcomingSessionCountdown(
    AppLocalizations l10n,
    ParentDashboardState state,
    String? selectedPatientId,
  ) {
    return localizedParentHeroUpcomingSessionCountdownLabel(
      l10n,
      sessions: state.sessions,
      selectedPatientId: selectedPatientId,
    );
  }

  String _tasksSummarySubtitle(
    ParentDashboardState state,
    AppLocalizations l10n,
  ) {
    final completed = state.streakInfo.completedToday;
    final total = state.streakInfo.totalToday;
    if (total <= 0) {
      return l10n.parentDashboardAssignedForToday;
    }
    return l10n.parentDashboardCompletedCount(completed, total);
  }

  String _formatDate(DateTime? date, AppLocalizations l10n) {
    if (date == null) {
      return l10n.parentDashboardRecently;
    }
    return DateFormat('MMM d, yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentDashboardProvider);
    final caseIntakeState = ref.watch(parentCaseIntakeProvider);
    final auth = ref.watch(authProvider);
    final notifications = ref.watch(parentNotificationsProvider);
    final l10n = AppLocalizations.of(context)!;
    final unreadMessageCount = notifications.unreadMessageCount;
    final profileImageUrl = auth.user?.profileImageUrl;
    final displayName = auth.user?.fullName ?? state.user?.fullName;
    final theme = Theme.of(context);
    final userName = dashboardDisplayName(displayName);
    final selectedChild = state.selectedChild;
    final journeyState = selectedChild != null
        ? ref.watch(parentProgressProvider(selectedChild.id))
        : const ParentProgressState();
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
        messageCount: unreadMessageCount,
        showMenuButton: false,
        currentNav: DashboardNavItem.home,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onMessagesTap: _openMessages,
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: const DashboardLoadingCard(),
      );
    }

    if (state.errorMessage != null && !state.hasAuth) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        messageCount: unreadMessageCount,
        showMenuButton: false,
        currentNav: DashboardNavItem.home,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onMessagesTap: _openMessages,
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
      messageCount: unreadMessageCount,
      showMenuButton: false,
      currentNav: DashboardNavItem.home,
      onNavTap: (item) => ParentNavigation.onNavTap(context, item),
      onMessagesTap: _openMessages,
      onNotificationsTap: _onNotificationsTap,
      onAvatarTap: _onAvatarTap,
      scrollBody: false,
      navAccentColor: DashboardColors.brandCyan,
      floatingActionButton: DecoratedBox(
        decoration: BoxDecoration(
          gradient: DashboardColors.brandPrimaryGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: DashboardColors.brandCyan.withValues(alpha: 0.22),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: FloatingActionButton(
          onPressed: _openAiChat,
          backgroundColor: Colors.transparent,
          elevation: 0,
          highlightElevation: 0,
          foregroundColor: Colors.white,
          tooltip: l10n.clinicalAiAssistant,
          child: const Icon(Icons.smart_toy_outlined),
        ),
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
              if (state.children.isEmpty) ...[
                DashboardGreeting(message: l10n.dashboardWelcomeBack(userName)),
                SizedBox(height: context.dashSpacing * 0.75),
                ParentDashboardCaseIntakeSection(
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
              ] else
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: DashboardGreeting(
                        message: l10n.dashboardWelcomeBack(userName),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ConstrainedBox(
                      constraints: const BoxConstraints(
                        minWidth: 128,
                        maxWidth: 160,
                      ),
                      child: ParentChildSwitcher(
                        compact: true,
                        children: state.children,
                        selectedPatientId: state.selectedPatientId,
                        onSelected: (childId) {
                          ref
                              .read(parentDashboardProvider.notifier)
                              .selectPatient(childId);
                        },
                      ),
                    ),
                  ],
                ),
              if (state.errorMessage != null) ...[
                SizedBox(height: context.dashSpacing * 0.75),
                DashboardErrorCard(
                  message: state.errorMessage!,
                  onRetry: () => _refreshDashboardDomains(),
                ),
              ],
              if (state.children.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.85),
                if (state.isLoadingChild)
                  DashboardLoadingCard(
                    message: l10n.parentDashboardUpdatingInsights,
                  )
                else if (selectedChild != null) ...[
                  ParentDashboardHeroCard(
                    childName: selectedChild.name,
                    profileImageUrl: selectedChild.profileImageUrl,
                    categoryLabel: _heroCategoryLabel(
                      selectedChild,
                      caseIntakeState,
                      state,
                      l10n,
                    ),
                    progress: _childProgressValue(state, selectedChild.id),
                    improvementLabel: null,
                    upcomingSessionLabel: _heroUpcomingSessionCountdown(
                      l10n,
                      state,
                      selectedChild.id,
                    ),
                    onViewDetails: _openChildDetails,
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  ParentTreatmentJourneyCard(
                    journey: journeyState.treatmentJourney,
                    isLoading: journeyState.isJourneyLoading,
                    error: journeyState.journeyError,
                    onTap: _openProgress,
                    onRetry: () => ref
                        .read(parentProgressProvider(selectedChild.id).notifier)
                        .loadTreatmentJourney(
                          selectedChild.id,
                          period: 'weekly',
                        ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  ParentTodaySummaryRow(
                    tasksValue:
                        '${state.streakInfo.totalToday > 0 ? state.streakInfo.totalToday : state.overview.todaysTasksCount}',
                    tasksSubtitle: _tasksSummarySubtitle(state, l10n),
                    tasksStreakLabel: l10n.parentDashboardRehabStreak(
                      state.streakInfo.streakDays,
                    ),
                    sessionsValue: '${state.overview.upcomingSessionsCount}',
                    sessionsSubtitle: state.overview.upcomingSessionsCount == 1
                        ? l10n.parentDashboardSessionScheduled
                        : l10n.parentDashboardSessionsScheduled,
                    onTasksTap: _onTasksCardTap,
                    onSessionsTap: _onSessionsCardTap,
                  ),
                  SizedBox(height: context.dashSpacing * 0.85),
                  if (state.aiInsight != null) ...[
                    ParentAiInsightCard(insight: state.aiInsight!),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  if (state.attentionAlert != null) ...[
                    ParentAttentionAlertCard(alert: state.attentionAlert!),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  if (state.nextAction.type !=
                      ParentNextActionType.reviewFeedback) ...[
                    ParentNextActionButton(
                      action: state.nextAction,
                      onPressed: () => _handleNextAction(state.nextAction),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                ],
              ],
              SizedBox(height: context.dashSpacing * 0.65),
              if (state.isLoadingChild)
                DashboardLoadingCard(
                  message: l10n.parentDashboardUpdatingInsights,
                )
              else ...[
                DashboardSectionHeader(
                  title: l10n.parentDashboardTodaysTasks,
                  linkColor: DashboardColors.brandCyan,
                  onActionTap: () =>
                      _pushAndRefresh(AppRoutes.parentDailyTasks),
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                if (state.dailyTasks.isEmpty)
                  DashboardEmptyCard(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.dashSpacing * 0.9,
                      vertical: context.dashSpacing * 1.1,
                    ),
                    message: state.children.isEmpty
                        ? l10n.parentDashboardTasksEmptyAwaitingProfile
                        : selectedChild == null
                        ? l10n.parentDashboardTasksEmptySelectChild
                        : l10n.parentDashboardTasksEmptyForChild(
                            selectedChild.name,
                          ),
                  )
                else
                  ...state.dailyTasks.asMap().entries.map((entry) {
                    final index = entry.key;
                    final task = entry.value;
                    return Padding(
                      padding: EdgeInsets.only(
                        bottom: context.dashSpacing * 0.6,
                      ),
                      child: DashboardSurfaceCard(
                        onTap: () => _openExercise(task),
                        child: Row(
                          children: [
                            Container(
                              padding: EdgeInsets.all(
                                context.dashSpacing * 0.45,
                              ),
                              decoration: BoxDecoration(
                                color: _taskColor(
                                  index,
                                ).withValues(alpha: 0.12),
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
                SizedBox(height: context.dashSpacing * 0.75),
                DashboardSectionHeader(
                  title: '${l10n.entityChild} ${l10n.clinicalProgress}',
                  linkColor: DashboardColors.brandCyan,
                  onActionTap: _openProgress,
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                if (selectedChild == null)
                  DashboardEmptyCard(
                    message: l10n.parentDashboardSelectChildForProgress,
                  )
                else
                  ParentChildProgressCard(
                    child: selectedChild,
                    progress: _childProgressValue(state, selectedChild.id),
                    color: _progressColor(0),
                  ),
                SizedBox(height: context.dashSpacing),
                ParentAiAssistantCard(onTap: _openAiChat),
                SizedBox(height: context.dashSpacing),
                DashboardSectionHeader(
                  title: l10n.parentDashboardLatestUpdates,
                  linkColor: DashboardColors.brandCyan,
                  onActionTap: () => _pushAndRefresh(AppRoutes.parentReports),
                ),
                SizedBox(height: context.dashSpacing * 0.45),
                ParentLatestUpdatesSection(
                  reportTitle: state.reports.isNotEmpty
                      ? state.reports.first.title
                      : _latestReportTitle(state),
                  reportSubtitle: state.reports.isNotEmpty
                      ? [
                          if (state.reports.first.summary != null)
                            state.reports.first.summary,
                          _formatDate(state.reports.first.date, l10n),
                        ].whereType<String>().join(' • ')
                      : null,
                  onReportTap: () => _onLatestReportCardTap(state),
                  feedback: state.latestFeedback,
                  onFeedbackTap: state.latestFeedback == null
                      ? null
                      : () => _handleNextAction(
                          const ParentNextAction(
                            label: 'Review Specialist Feedback',
                            type: ParentNextActionType.reviewFeedback,
                          ),
                        ),
                ),
                SizedBox(height: context.dashSpacing),
              ],
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
