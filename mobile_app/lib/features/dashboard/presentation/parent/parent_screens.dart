import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../case_intake/providers/parent_case_intake_provider.dart';
import '../../models/parent_dashboard_models.dart';
import '../../models/parent_profile_models.dart';
import '../../providers/parent_dashboard_provider.dart';
import '../../providers/parent_features_provider.dart';
import '../../providers/parent_profile_provider.dart';
import '../../utils/parent_notification_navigation.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_field.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/shared_profile_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_navigation.dart';
import '../../widgets/parent_page_scaffold.dart';
import 'parent_ui_helpers.dart';

export 'parent_sessions_screen.dart';

class ParentChildrenScreen extends ConsumerStatefulWidget {
  const ParentChildrenScreen({super.key});

  @override
  ConsumerState<ParentChildrenScreen> createState() =>
      _ParentChildrenScreenState();
}

class _ParentChildrenScreenState extends ConsumerState<ParentChildrenScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!ref.read(parentDashboardProvider).hasAuth) {
        ref.read(parentDashboardProvider.notifier).initialize();
      }
    });
  }

  ParentChild? _progressFor(String childId, List<ParentChild> progressList) {
    for (final child in progressList) {
      if (child.id == childId) {
        return child;
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentDashboardProvider);
    final theme = Theme.of(context);

    return ParentPageScaffold(
      title: 'Children',
      currentNav: DashboardNavItem.patients,
      body: ParentAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(parentDashboardProvider.notifier).refresh(),
        isEmpty: state.children.isEmpty,
        emptyMessage:
            'No linked children yet. Add a child from the specialist portal.',
        child: Column(
          children: state.children.map((child) {
            final progressChild = _progressFor(
              child.id,
              state.childrenProgress,
            );
            final progress =
                progressChild?.progressPercent ?? child.progressPercent;
            final metaParts = <String>[
              if (child.age != null) '${child.age} yrs',
              if (child.dateOfBirth != null)
                parentFormatDate(child.dateOfBirth),
              if (child.gender != null && child.gender!.isNotEmpty)
                child.gender!,
            ];

            return Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
              child: DashboardSurfaceCard(
                onTap: () => context.push(
                  AppRoutes.parentChildDetail.replaceFirst(
                    ':childId',
                    child.id,
                  ),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: DashboardColors.brandSoft,
                      child: Text(
                        dashboardAvatarLetter(child.name),
                        style: const TextStyle(
                          color: DashboardColors.brandCyan,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.65),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            child.name,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: DashboardColors.textPrimary,
                            ),
                          ),
                          if (metaParts.isNotEmpty)
                            Text(
                              metaParts.join(' • '),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textMuted,
                              ),
                            ),
                          if (progress != null)
                            Text(
                              '${progress <= 1 ? (progress * 100).round() : progress.round()}% progress',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            )
                          else
                            Text(
                              'Progress will appear once exercises are tracked.',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (progress != null)
                      Text(
                        '${progress <= 1 ? (progress * 100).round() : progress.round()}%',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: DashboardColors.brandCyan,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    Icon(
                      Icons.chevron_right_rounded,
                      color: DashboardColors.textMuted,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class ParentReportsScreen extends ConsumerStatefulWidget {
  const ParentReportsScreen({super.key});

  @override
  ConsumerState<ParentReportsScreen> createState() =>
      _ParentReportsScreenState();
}

class _ParentReportsScreenState extends ConsumerState<ParentReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!ref.read(parentDashboardProvider).hasAuth) {
        ref.read(parentDashboardProvider.notifier).initialize();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentDashboardProvider);
    final theme = Theme.of(context);
    final selectedChild = state.selectedChild;

    return ParentPageScaffold(
      title: 'Reports',
      currentNav: DashboardNavItem.reports,
      body: state.isLoading
          ? const Center(child: DashboardLoadingCard())
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (state.errorMessage != null)
                    DashboardErrorCard(
                      message: state.errorMessage!,
                      onRetry: () =>
                          ref.read(parentDashboardProvider.notifier).refresh(),
                    ),
                  ParentChildSwitcher(
                    children: state.children,
                    selectedPatientId: state.selectedPatientId,
                    onSelected: (childId) {
                      ref
                          .read(parentDashboardProvider.notifier)
                          .selectPatient(childId);
                    },
                  ),
                  SizedBox(height: context.dashSpacing),
                  if (state.isLoadingChild)
                    const DashboardLoadingCard(message: 'Loading reports...')
                  else if (selectedChild == null)
                    const DashboardEmptyCard(
                      message: 'Select a child to view reports.',
                    )
                  else if (state.reports.isEmpty)
                    DashboardEmptyCard(
                      message:
                          'No reports available for ${selectedChild.name}.',
                    )
                  else
                    ...state.reports.map(
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
                                  color: DashboardColors.brandSoft,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.description_outlined,
                                  color: DashboardColors.brandCyan,
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
                                        if (report.reportType != null)
                                          report.reportType,
                                        selectedChild.name,
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
                              if (report.pdfUrl != null &&
                                  report.pdfUrl!.isNotEmpty)
                                IconButton(
                                  onPressed: () => parentOpenReportUrl(
                                    context,
                                    report.pdfUrl,
                                  ),
                                  tooltip: 'Open report',
                                  icon: Icon(
                                    Icons.open_in_new_outlined,
                                    color: DashboardColors.brandCyan,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

class ParentNotificationsScreen extends ConsumerStatefulWidget {
  const ParentNotificationsScreen({super.key});

  @override
  ConsumerState<ParentNotificationsScreen> createState() =>
      _ParentNotificationsScreenState();
}

class _ParentNotificationsScreenState
    extends ConsumerState<ParentNotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentNotificationsProvider.notifier).initialize();
    });
  }

  Future<void> _onNotificationTap(ParentNotificationItem item) async {
    if (!item.isRead) {
      await ref.read(parentNotificationsProvider.notifier).markAsRead(item.id);
    }

    if (!mounted) {
      return;
    }

    if (isCaseRequestNotification(item)) {
      await refreshParentDataAfterCaseNotification(ref);
      if (!mounted) {
        return;
      }
    }

    final destination = await resolveParentNotificationDestination(ref, item);
    if (!mounted || destination == null) {
      return;
    }

    await context.push(destination);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentNotificationsProvider);
    final theme = Theme.of(context);

    return ParentPageScaffold(
      title: 'Notifications',
      showBackButton: true,
      actions: [
        if (state.unreadCount > 0)
          TextButton(
            onPressed: state.isUpdating
                ? null
                : () => ref
                      .read(parentNotificationsProvider.notifier)
                      .markAllAsRead(),
            child: const Text('Mark all as read'),
          ),
      ],
      body: ParentAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(parentNotificationsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No notifications yet.',
        child: Column(
          children: state.items
              .map(
                (item) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    onTap: () => _onNotificationTap(item),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          item.isRead
                              ? Icons.notifications_none_rounded
                              : Icons.notifications_active_rounded,
                          color: item.isRead
                              ? DashboardColors.textMuted
                              : DashboardColors.brandCyan,
                        ),
                        SizedBox(width: context.dashSpacing * 0.65),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: item.isRead
                                      ? FontWeight.w500
                                      : FontWeight.w700,
                                ),
                              ),
                              if (item.message != null)
                                Text(
                                  item.message!,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
                              Text(
                                '${item.type ?? 'Update'} • ${_formatDate(item.createdAt)}',
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: DashboardColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}

class ParentProfileScreen extends ConsumerStatefulWidget {
  const ParentProfileScreen({super.key});

  @override
  ConsumerState<ParentProfileScreen> createState() =>
      _ParentProfileScreenState();
}

class _ParentProfileScreenState extends ConsumerState<ParentProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentProfileProvider.notifier).initialize();
    });
  }

  List<DashboardProfileFieldEntry> _profileFields(ParentProfileBundle bundle) {
    final fields = buildRequiredProfileFields(
      fullName: bundle.fullName,
      email: bundle.email,
      role: 'parent',
    );

    appendOptionalProfileField(fields, 'Phone', bundle.phone);
    appendOptionalProfileField(fields, 'Address', bundle.address);
    appendOptionalProfileField(
      fields,
      'Relationship Notes',
      bundle.relationshipNotes,
      multiline: true,
    );

    return fields;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentProfileProvider);
    final bundle = state.bundle;

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: () => ref.read(parentProfileProvider.notifier).refresh(),
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Profile not available.'),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: () => ref.read(parentProfileProvider.notifier).refresh(),
        color: DashboardColors.brandCyan,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: SharedProfileCard(
            initials: bundle.fullName,
            initialsFallback: 'PR',
            imageUrl: bundle.profileImageUrl,
            fields: _profileFields(bundle),
            presenceUserId: bundle.userId,
            accentColor: DashboardColors.brandCyan,
            cardTint: DashboardColors.brandCyan,
            useBrandLogoutGradient: true,
            onEditPressed: () => context.push(AppRoutes.parentEditProfile),
            onLogout: () => ParentNavigation.logout(context, ref),
          ),
        ),
      );
    }

    return ParentPageScaffold(
      title: 'Profile',
      showBackButton: true,
      body: body,
    );
  }
}

class ParentMoreScreen extends ConsumerStatefulWidget {
  const ParentMoreScreen({super.key});

  @override
  ConsumerState<ParentMoreScreen> createState() => _ParentMoreScreenState();
}

class _ParentMoreScreenState extends ConsumerState<ParentMoreScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentCaseIntakeProvider.notifier).loadRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    final caseIntakeState = ref.watch(parentCaseIntakeProvider);
    final activeCaseRequestCount = countActiveParentCaseRequests(
      caseIntakeState.requests,
    );

    return ParentPageScaffold(
      title: 'More',
      currentNav: DashboardNavItem.more,
      body: ListView(
        padding: context.dashPadding,
        children: [
          _MoreTile(
            icon: Icons.assignment_outlined,
            label: 'Case Requests',
            badgeCount: activeCaseRequestCount,
            onTap: () => context.push(AppRoutes.parentCaseRequests),
          ),
          _MoreTile(
            icon: Icons.chat_bubble_outline_rounded,
            label: 'Messages',
            onTap: () => context.push(AppRoutes.parentMessages),
          ),
          _MoreTile(
            icon: Icons.person_outline_rounded,
            label: 'Profile',
            onTap: () => context.push(AppRoutes.parentProfile),
          ),
          _MoreTile(
            icon: Icons.notifications_none_rounded,
            label: 'Notifications',
            onTap: () => context.push(AppRoutes.parentNotifications),
          ),
          _MoreTile(
            icon: Icons.logout_rounded,
            label: 'Logout',
            onTap: () => ParentNavigation.logout(context, ref),
          ),
        ],
      ),
    );
  }
}

class _MoreTile extends StatelessWidget {
  const _MoreTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.badgeCount = 0,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final int badgeCount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, color: DashboardColors.brandCyan),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Text(
                label,
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            if (badgeCount > 0)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: DashboardColors.brandCyan,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  badgeCount > 9 ? '9+' : '$badgeCount',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}

String _formatDate(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('MMM d, yyyy').format(date);
}
