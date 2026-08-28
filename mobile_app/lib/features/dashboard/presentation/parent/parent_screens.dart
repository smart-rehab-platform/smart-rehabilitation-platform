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
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_profile_field.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/shared_profile_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_navigation.dart';
import '../../widgets/parent_page_scaffold.dart';
import 'parent_ui_helpers.dart';
import '../../../../core/locale/language_selector.dart';
import '../../../../l10n/app_localizations.dart';
import 'parent_scoped_localization_utils.dart';

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
    final l10n = AppLocalizations.of(context)!;
    final mappedError = state.errorMessage == null
        ? null
        : mapParentDashboardError(l10n, state.errorMessage!);

    return ParentPageScaffold(
      title: l10n.parentChildrenScreenTitle,
      currentNav: DashboardNavItem.patients,
      body: ParentAsyncBody(
        isLoading: state.isLoading,
        errorMessage: mappedError,
        onRetry: () => ref.read(parentDashboardProvider.notifier).refresh(),
        isEmpty: state.children.isEmpty,
        emptyMessage: l10n.parentChildrenNoLinked,
        child: Column(
          children: state.children.map((child) {
            final progressChild = _progressFor(
              child.id,
              state.childrenProgress,
            );
            final progress =
                progressChild?.progressPercent ?? child.progressPercent;
            final metaParts = buildChildMetaParts(
              l10n: l10n,
              child: child,
              formatDate: parentFormatDate,
            );
            final progressPercent = progress == null
                ? null
                : normalizeProgressPercent(progress);

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
                    DashboardProfileAvatar(
                      initials: dashboardAvatarLetter(child.name),
                      imageUrl: child.profileImageUrl,
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
                          if (progressPercent != null)
                            Text(
                              l10n.parentChildrenProgressPercent(
                                progressPercent,
                              ),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            )
                          else
                            Text(
                              l10n.parentChildrenProgressPending,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (progressPercent != null)
                      Text(
                        '$progressPercent%',
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
    final l10n = AppLocalizations.of(context)!;
    final mappedError = state.errorMessage == null
        ? null
        : mapParentDashboardError(l10n, state.errorMessage!);

    return ParentPageScaffold(
      title: l10n.navReports,
      currentNav: DashboardNavItem.reports,
      body: state.isLoading
          ? Center(
              child: DashboardLoadingCard(message: l10n.parentReportsLoading),
            )
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (mappedError != null)
                    DashboardErrorCard(
                      message: mappedError,
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
                    DashboardLoadingCard(message: l10n.parentReportsLoading)
                  else if (selectedChild == null)
                    DashboardEmptyCard(message: l10n.parentReportsSelectChild)
                  else if (state.reports.isEmpty)
                    DashboardEmptyCard(
                      message: l10n.parentReportsEmptyForChild(
                        selectedChild.name,
                      ),
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
                                    parentOpenReportUrl(context, l10n, report.pdfUrl)
                              : null,
                          onLongPress:
                              report.pdfUrl != null && report.pdfUrl!.isNotEmpty
                              ? () => parentLongPressReportUrl(
                                  context,
                                  l10n,
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
                                          localizedReportType(
                                            l10n,
                                            report.reportType!,
                                          ),
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
                                    l10n,
                                    report.pdfUrl,
                                  ),
                                  tooltip: l10n.parentReportsOpenReport,
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
    if (!mounted ||
        destination == null ||
        destination == AppRoutes.parentNotifications) {
      return;
    }

    await context.push(destination);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentNotificationsProvider);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final mappedError = state.errorMessage == null
        ? null
        : mapParentNotificationsError(l10n, state.errorMessage!);

    return ParentPageScaffold(
      title: l10n.navNotifications,
      showBackButton: true,
      actions: [
        if (state.unreadCount > 0)
          TextButton(
            onPressed: state.isUpdating
                ? null
                : () => ref
                      .read(parentNotificationsProvider.notifier)
                      .markAllAsRead(),
            child: Text(l10n.parentNotificationsMarkAllRead),
          ),
      ],
      body: state.isLoading
          ? Center(
              child: DashboardLoadingCard(
                message: l10n.parentNotificationsLoading,
              ),
            )
          : ParentAsyncBody(
              isLoading: false,
              errorMessage: mappedError,
              onRetry: () =>
                  ref.read(parentNotificationsProvider.notifier).refresh(),
              isEmpty: state.items.isEmpty,
              emptyMessage: l10n.parentNotificationsEmpty,
              child: Column(
                children: state.items
                    .map(
                      (item) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.6,
                        ),
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
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            fontWeight: item.isRead
                                                ? FontWeight.w500
                                                : FontWeight.w700,
                                          ),
                                    ),
                                    if (item.message != null)
                                      Text(
                                        item.message!,
                                        style: theme.textTheme.bodySmall
                                            ?.copyWith(
                                              color:
                                                  DashboardColors.textSecondary,
                                            ),
                                      ),
                                    Text(
                                      '${item.type ?? l10n.notificationTypeUpdate} • ${_formatDate(item.createdAt)}',
                                      style: theme.textTheme.labelSmall
                                          ?.copyWith(
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

  List<DashboardProfileFieldEntry> _profileFields(
    ParentProfileBundle bundle,
    AppLocalizations l10n,
  ) {
    final fields = <DashboardProfileFieldEntry>[
      DashboardProfileFieldEntry(
        label: l10n.fieldFullName,
        value: bundle.fullName,
      ),
      DashboardProfileFieldEntry(label: l10n.fieldEmail, value: bundle.email),
      DashboardProfileFieldEntry(label: l10n.fieldRole, value: l10n.roleParent),
    ];

    appendOptionalProfileField(fields, l10n.fieldPhone, bundle.phone);
    appendOptionalProfileField(fields, l10n.fieldAddress, bundle.address);
    appendOptionalProfileField(
      fields,
      l10n.parentProfileRelationshipNotes,
      bundle.relationshipNotes,
      multiline: true,
    );

    return fields;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentProfileProvider);
    final bundle = state.bundle;
    final l10n = AppLocalizations.of(context)!;

    Widget body;
    if (state.isLoading) {
      body = Center(
        child: DashboardLoadingCard(message: l10n.parentProfileLoading),
      );
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapParentProfileError(l10n, state.errorMessage!),
          onRetry: () => ref.read(parentProfileProvider.notifier).refresh(),
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardEmptyCard(message: l10n.parentProfileNotAvailable),
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
                fields: _profileFields(bundle, l10n),
                presenceUserId: bundle.userId,
                accentColor: DashboardColors.brandCyan,
                cardTint: DashboardColors.brandCyan,
                useBrandLogoutGradient: true,
                editProfileLabel: l10n.parentProfileEditProfile,
                logoutLabel: l10n.commonLogout,
                onEditPressed: () => context.push(AppRoutes.parentEditProfile),
                onLogout: () => ParentNavigation.logout(context, ref),
              ),
        ),
      );
    }

    return ParentPageScaffold(
      title: l10n.navProfile,
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

  void _openProgress() {
    final childId = ref.read(parentDashboardProvider).selectedPatientId;
    final l10n = AppLocalizations.of(context)!;
    if (childId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentDashboardSelectChildForProgress)),
      );
      return;
    }
    context.push(
      '${AppRoutes.parentProgress}?childId=${Uri.encodeComponent(childId)}',
    );
  }

  void _openSessions() {
    context.push(AppRoutes.parentSessions);
  }

  void _openFeedback() {
    final childId = ref.read(parentDashboardProvider).selectedPatientId;
    final l10n = AppLocalizations.of(context)!;
    if (childId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentDashboardSelectChildForFeedback)),
      );
      return;
    }
    context.push(AppRoutes.parentFeedback);
  }

  @override
  Widget build(BuildContext context) {
    final caseIntakeState = ref.watch(parentCaseIntakeProvider);
    final activeCaseRequestCount = countActiveParentCaseRequests(
      caseIntakeState.requests,
    );
    final l10n = AppLocalizations.of(context)!;

    return ParentPageScaffold(
      title: l10n.commonMore,
      currentNav: DashboardNavItem.more,
      body: ListView(
        padding: context.dashPadding,
        children: [
          const LanguageSelector(
            presentation: LanguageSelectorPresentation.settingsTile,
          ),
          _MoreTile(
            icon: Icons.trending_up_rounded,
            label: l10n.navProgress,
            onTap: _openProgress,
          ),
          _MoreTile(
            icon: Icons.calendar_today_outlined,
            label: l10n.navSessions,
            onTap: _openSessions,
          ),
          _MoreTile(
            icon: Icons.rate_review_outlined,
            label: l10n.navFeedback,
            onTap: _openFeedback,
          ),
          _MoreTile(
            icon: Icons.assignment_outlined,
            label: l10n.navCaseRequests,
            badgeCount: activeCaseRequestCount,
            onTap: () => context.push(AppRoutes.parentCaseRequests),
          ),
          _MoreTile(
            icon: Icons.report_outlined,
            label: l10n.complaintMoreReportSpecialist,
            subtitle: l10n.complaintMoreReportSpecialistSubtitle,
            onTap: () => context.push(AppRoutes.parentComplaintNew),
          ),
          _MoreTile(
            icon: Icons.history_rounded,
            label: l10n.complaintHistoryTitle,
            onTap: () => context.push(AppRoutes.parentComplaints),
          ),
          _MoreTile(
            icon: Icons.chat_bubble_outline_rounded,
            label: l10n.navMessages,
            onTap: () => context.push(AppRoutes.parentMessages),
          ),
          _MoreTile(
            icon: Icons.person_outline_rounded,
            label: l10n.navProfile,
            onTap: () => context.push(AppRoutes.parentProfile),
          ),
          _MoreTile(
            icon: Icons.notifications_none_rounded,
            label: l10n.navNotifications,
            onTap: () => context.push(AppRoutes.parentNotifications),
          ),
          _MoreTile(
            icon: Icons.logout_rounded,
            label: l10n.commonLogout,
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
    this.subtitle,
    this.badgeCount = 0,
  });

  final IconData icon;
  final String label;
  final String? subtitle;
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  if (subtitle != null && subtitle!.isNotEmpty)
                    Text(
                      subtitle!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                ],
              ),
            ),
            if (badgeCount > 0)
              Container(
                margin: const EdgeInsetsDirectional.only(end: 8),
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
