import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../models/specialist_dashboard_models.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_dashboard_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/specialist_navigation.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_widgets.dart';

class SpecialistPatientsScreen extends ConsumerStatefulWidget {
  const SpecialistPatientsScreen({super.key});

  @override
  ConsumerState<SpecialistPatientsScreen> createState() =>
      _SpecialistPatientsScreenState();
}

class _SpecialistPatientsScreenState
    extends ConsumerState<SpecialistPatientsScreen> {
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
                    onTap: () => context.push(
                      AppRoutes.specialistPatientDetails(patient.id),
                    ),
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
                        Icon(
                          Icons.chevron_right_rounded,
                          color: DashboardColors.textMuted,
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
        onRetry: () =>
            ref.read(specialistProgressListProvider.notifier).refresh(),
        isEmpty: state.items.isEmpty,
        emptyMessage: 'No progress data available yet.',
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

class _SpecialistExercisesScreenState
    extends ConsumerState<SpecialistExercisesScreen> {
  late final TextEditingController _searchController;
  String _selectedCategory = specialistExerciseAllCategoryLabel;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistExercisesProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistExercisesProvider);
    final notifier = ref.read(specialistExercisesProvider.notifier);
    final theme = Theme.of(context);
    final categories = buildExerciseCategoryFilters(state.items);
    final visible = filterExercises(
      state.items,
      searchQuery: _searchController.text,
      selectedCategory: _selectedCategory,
    );

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && state.items.isEmpty) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.refresh,
        ),
      );
    } else {
      body = ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: context.dashPadding,
        children: [
          Text(
            'Exercise Library',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            'Browse therapy exercises by category and search.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          buildExerciseSearchField(
            controller: _searchController,
            onChanged: (_) => setState(() {}),
          ),
          if (state.items.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            SpecialistExerciseCategoryChips(
              categories: categories,
              selected: _selectedCategory,
              onChanged: (value) => setState(() => _selectedCategory = value),
            ),
          ],
          if (state.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: state.errorMessage!,
              onRetry: notifier.refresh,
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.75),
          if (state.items.isEmpty)
            const DashboardEmptyCard(
              message:
                  'No exercises available yet. New exercises will appear here once added.',
            )
          else if (visible.isEmpty)
            const DashboardEmptyCard(
              message: 'No exercises match your filters.',
            )
          else
            ...visible.map(
              (exercise) => SpecialistExerciseCard(exercise: exercise),
            ),
          SizedBox(height: context.dashSpacing),
        ],
      );
    }

    return SpecialistPageScaffold(
      title: 'Exercises',
      currentNav: DashboardNavItem.exercises,
      body: body,
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
                : () => ref
                      .read(specialistNotificationsProvider.notifier)
                      .markAllAsRead(),
            child: const Text('Mark all as read'),
          ),
      ],
      body: SpecialistAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () =>
            ref.read(specialistNotificationsProvider.notifier).refresh(),
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
                                  fontWeight: item.isRead
                                      ? FontWeight.w500
                                      : FontWeight.w700,
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
            icon: Icons.chat_bubble_outline_rounded,
            label: 'Messages',
            onTap: () => context.push(AppRoutes.specialistMessages),
          ),
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
      onTap: review.id.isEmpty
          ? null
          : () => context.push(AppRoutes.specialistReviewExercise(review.id)),
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
          SizedBox(width: context.dashSpacing * 0.25),
          Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
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
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}
