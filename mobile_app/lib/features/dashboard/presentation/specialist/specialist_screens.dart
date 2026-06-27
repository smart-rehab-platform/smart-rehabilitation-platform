import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/specialist_dashboard_models.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_dashboard_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/specialist_navigation.dart';
import '../../widgets/specialist_page_scaffold.dart';

class SpecialistPatientsScreen extends ConsumerStatefulWidget {
  const SpecialistPatientsScreen({super.key});

  @override
  ConsumerState<SpecialistPatientsScreen> createState() =>
      _SpecialistPatientsScreenState();
}

class _SpecialistPatientsScreenState extends ConsumerState<SpecialistPatientsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistPatientsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistPatientsProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Active Cases',
      currentNav: DashboardNavItem.patients,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistPatientsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No active cases assigned yet.',
        child: Column(
          children: state.items
              .map(
                (patient) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    child: Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: DashboardColors.blueSoft,
                          child: Text(
                            dashboardAvatarLetter(patient.name),
                            style: TextStyle(
                              color: const Color(0xFF3B82F6),
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
                                patient.name,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              if (patient.diagnosis != null)
                                Text(
                                  patient.diagnosis!,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
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

class SpecialistPendingReviewsScreen extends ConsumerStatefulWidget {
  const SpecialistPendingReviewsScreen({super.key});

  @override
  ConsumerState<SpecialistPendingReviewsScreen> createState() =>
      _SpecialistPendingReviewsScreenState();
}

class _SpecialistPendingReviewsScreenState
    extends ConsumerState<SpecialistPendingReviewsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistPendingReviewsListProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistPendingReviewsListProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Pending Reviews',
      showBackButton: true,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () =>
            ref.read(specialistPendingReviewsListProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No pending reviews right now.',
        child: Column(
          children: state.items
              .map((review) => _buildReviewCard(context, theme, review))
              .toList(),
        ),
      ),
    );
  }
}

class SpecialistSessionsScreen extends ConsumerStatefulWidget {
  const SpecialistSessionsScreen({super.key});

  @override
  ConsumerState<SpecialistSessionsScreen> createState() =>
      _SpecialistSessionsScreenState();
}

class _SpecialistSessionsScreenState extends ConsumerState<SpecialistSessionsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistSessionsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistSessionsProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: "Today's Sessions",
      showBackButton: true,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistSessionsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No sessions scheduled for today.',
        child: Column(
          children: state.items
              .map((session) => _buildSessionCard(context, theme, session))
              .toList(),
        ),
      ),
    );
  }
}

class SpecialistTreatmentPlansScreen extends ConsumerStatefulWidget {
  const SpecialistTreatmentPlansScreen({super.key});

  @override
  ConsumerState<SpecialistTreatmentPlansScreen> createState() =>
      _SpecialistTreatmentPlansScreenState();
}

class _SpecialistTreatmentPlansScreenState
    extends ConsumerState<SpecialistTreatmentPlansScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistTreatmentPlansProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistTreatmentPlansProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Treatment Plans',
      showBackButton: true,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () =>
            ref.read(specialistTreatmentPlansProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No treatment plans found.',
        child: Column(
          children: state.items
              .map(
                (plan) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          plan.title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.2),
                        Text(
                          plan.patientName,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.2),
                        Text(
                          '${plan.status ?? 'Active'} • ${formatDashboardDate(plan.startDate)} → ${formatDashboardDate(plan.endDate)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textMuted,
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

class SpecialistPatientProgressScreen extends ConsumerStatefulWidget {
  const SpecialistPatientProgressScreen({super.key});

  @override
  ConsumerState<SpecialistPatientProgressScreen> createState() =>
      _SpecialistPatientProgressScreenState();
}

class _SpecialistPatientProgressScreenState
    extends ConsumerState<SpecialistPatientProgressScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistProgressListProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistProgressListProvider);

    return SpecialistPageScaffold(
      title: 'Patient Progress',
      showBackButton: true,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistProgressListProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage:
            'No progress data available yet.',
        child: DashboardSurfaceCard(
          child: Column(
            children: [
              for (var i = 0; i < state.items.length; i++) ...[
                DashboardLinearProgressTile(
                  name: state.items[i].name,
                  progress: state.items[i].progress.clamp(0, 1),
                  avatarColor: _progressColor(i),
                ),
                if (i != state.items.length - 1)
                  Divider(
                    height: context.dashSpacing * 1.4,
                    color: DashboardColors.border,
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class SpecialistExercisesScreen extends ConsumerStatefulWidget {
  const SpecialistExercisesScreen({super.key});

  @override
  ConsumerState<SpecialistExercisesScreen> createState() =>
      _SpecialistExercisesScreenState();
}

class _SpecialistExercisesScreenState extends ConsumerState<SpecialistExercisesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistExercisesProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistExercisesProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Exercises',
      currentNav: DashboardNavItem.exercises,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistExercisesProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No exercises available yet.',
        child: Column(
          children: state.items
              .map(
                (exercise) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          exercise.title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (exercise.category != null) ...[
                          SizedBox(height: context.dashSpacing * 0.15),
                          Text(
                            exercise.category!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                        if (exercise.instructions != null) ...[
                          SizedBox(height: context.dashSpacing * 0.15),
                          Text(
                            exercise.instructions!,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                        ],
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

class SpecialistReportsScreen extends ConsumerStatefulWidget {
  const SpecialistReportsScreen({super.key});

  @override
  ConsumerState<SpecialistReportsScreen> createState() =>
      _SpecialistReportsScreenState();
}

class _SpecialistReportsScreenState extends ConsumerState<SpecialistReportsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistReportsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistReportsProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Reports',
      currentNav: DashboardNavItem.reports,
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistReportsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No reports found.',
        child: Column(
          children: state.items
              .map(
                (report) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          report.title,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (report.patientName != null)
                          Text(
                            report.patientName!,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                        Text(
                          '${report.reportType ?? 'Report'} • ${_formatDate(report.createdAt)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textMuted,
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

class SpecialistNotificationsScreen extends ConsumerStatefulWidget {
  const SpecialistNotificationsScreen({super.key});

  @override
  ConsumerState<SpecialistNotificationsScreen> createState() =>
      _SpecialistNotificationsScreenState();
}

class _SpecialistNotificationsScreenState
    extends ConsumerState<SpecialistNotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistNotificationsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistNotificationsProvider);
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Notifications',
      showBackButton: true,
      actions: [
        if (state.unreadCount > 0)
          TextButton(
            onPressed: state.isUpdating
                ? null
                : () => ref.read(specialistNotificationsProvider.notifier).markAllAsRead(),
            child: const Text('Mark all as read'),
          ),
      ],
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref.read(specialistNotificationsProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No notifications yet.',
        child: Column(
          children: state.items
              .map(
                (item) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: DashboardSurfaceCard(
                    onTap: () => ref
                        .read(specialistNotificationsProvider.notifier)
                        .markAsRead(item.id),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          item.isRead
                              ? Icons.notifications_none_rounded
                              : Icons.notifications_active_rounded,
                          color: item.isRead
                              ? DashboardColors.textMuted
                              : DashboardColors.primary,
                        ),
                        SizedBox(width: context.dashSpacing * 0.65),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight:
                                      item.isRead ? FontWeight.w500 : FontWeight.w700,
                                ),
                              ),
                              if (item.body != null)
                                Text(
                                  item.body!,
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

class SpecialistProfileScreen extends ConsumerWidget {
  const SpecialistProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final theme = Theme.of(context);

    return SpecialistPageScaffold(
      title: 'Profile',
      showBackButton: true,
      body: SingleChildScrollView(
        padding: context.dashPadding,
        child: DashboardSurfaceCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: CircleAvatar(
                  radius: 40,
                  backgroundColor: DashboardColors.purpleSoft,
                  child: Text(
                    dashboardInitials(user?.fullName, fallback: 'SP'),
                    style: theme.textTheme.headlineSmall?.copyWith(
                      color: DashboardColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing),
              _ProfileField(label: 'Full Name', value: user?.fullName ?? '—'),
              _ProfileField(label: 'Email', value: user?.email ?? '—'),
              _ProfileField(label: 'Role', value: user?.role ?? 'specialist'),
              if (user?.phone != null)
                _ProfileField(label: 'Phone', value: user!.phone!),
              SizedBox(height: context.dashSpacing),
              ElevatedButton(
                onPressed: () => SpecialistNavigation.logout(context, ref),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.75),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text('Logout'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class SpecialistMoreScreen extends ConsumerWidget {
  const SpecialistMoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SpecialistPageScaffold(
      title: 'More',
      currentNav: DashboardNavItem.more,
      body: ListView(
        padding: context.dashPadding,
        children: [
          _MoreTile(
            icon: Icons.person_outline_rounded,
            label: 'Profile',
            onTap: () => context.push(AppRoutes.specialistProfile),
          ),
          _MoreTile(
            icon: Icons.link_rounded,
            label: 'Manage Parent Links',
            onTap: () => context.push(AppRoutes.manageParentLinks),
          ),
          _MoreTile(
            icon: Icons.notifications_none_rounded,
            label: 'Notifications',
            onTap: () => context.push(AppRoutes.specialistNotifications),
          ),
          _MoreTile(
            icon: Icons.rate_review_outlined,
            label: 'Pending Reviews',
            onTap: () => context.push(AppRoutes.specialistPendingReviews),
          ),
          _MoreTile(
            icon: Icons.calendar_today_outlined,
            label: "Today's Sessions",
            onTap: () => context.push(AppRoutes.specialistSessions),
          ),
          _MoreTile(
            icon: Icons.assignment_outlined,
            label: 'Treatment Plans',
            onTap: () => context.push(AppRoutes.specialistTreatmentPlans),
          ),
          _MoreTile(
            icon: Icons.logout_rounded,
            label: 'Logout',
            onTap: () => SpecialistNavigation.logout(context, ref),
          ),
        ],
      ),
    );
  }
}

Widget _buildReviewCard(
  BuildContext context,
  ThemeData theme,
  SpecialistPendingReview review,
) {
  return Padding(
    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
    child: DashboardSurfaceCard(
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: DashboardColors.primary.withValues(alpha: 0.15),
            child: Text(
              dashboardAvatarLetter(review.patientName),
              style: TextStyle(
                color: DashboardColors.primary,
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
                  review.patientName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  '${review.exerciseTitle} • ${formatSubmittedAgo(review.submittedAt)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          DashboardPriorityBadge(label: review.priority),
        ],
      ),
    ),
  );
}

Widget _buildSessionCard(
  BuildContext context,
  ThemeData theme,
  SpecialistSessionDetail session,
) {
  return Padding(
    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
    child: DashboardSurfaceCard(
      child: Row(
        children: [
          Container(
            width: context.dashSpacing * 2.2,
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.45),
            decoration: BoxDecoration(
              color: DashboardColors.purpleSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              session.timeLabel,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.primary,
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
                  session.patientName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                                Text(
                                  session.displaySubtitle,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

Color _progressColor(int index) {
  const colors = [
    DashboardColors.primary,
    DashboardColors.accent,
    Color(0xFF3B82F6),
    DashboardColors.warning,
  ];
  return colors[index % colors.length];
}

String _formatDate(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return DateFormat('MMM d, yyyy').format(date);
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
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
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Row(
          children: [
            Icon(icon, color: DashboardColors.primary),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
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
