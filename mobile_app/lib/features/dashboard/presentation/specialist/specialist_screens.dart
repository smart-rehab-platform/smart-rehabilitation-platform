import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../core/theme/dashboard_theme.dart';
import '../../models/specialist_dashboard_models.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_dashboard_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/specialist_navigation.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_widgets.dart';
import 'treatment_plans_list_widgets.dart';

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
  late final TextEditingController _searchController;
  TreatmentPlanListFilter _filter = TreatmentPlanListFilter.all;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistTreatmentPlansProvider.notifier).initialize();
      ref.read(specialistPatientsProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Set<String> _activePatientIds(List<SpecialistTreatmentPlanItem> plans) {
    return plans
        .where((plan) => plan.isActive)
        .map((plan) => plan.patientId?.trim() ?? '')
        .where((id) => id.isNotEmpty)
        .toSet();
  }

  List<SpecialistTreatmentPlanItem> _visible(
    List<SpecialistTreatmentPlanItem> items,
  ) {
    final query = _searchController.text.trim().toLowerCase();
    return items.where((plan) {
      if (!_filter.matches(plan)) {
        return false;
      }
      if (query.isEmpty) {
        return true;
      }
      return plan.title.toLowerCase().contains(query) ||
          plan.patientName.toLowerCase().contains(query);
    }).toList();
  }

  Future<void> _openCreateForPatient({
    required String patientId,
    required String patientName,
  }) async {
    final created = await context.push<bool>(
      AppRoutes.specialistCreateTreatmentPlan(
        patientId: patientId,
        patientName: patientName,
      ),
    );
    if (!mounted) return;
    if (created == true) {
      await ref.read(specialistTreatmentPlansProvider.notifier).refresh();
    }
  }

  Future<void> _openPatientPicker() async {
    final patientsState = ref.read(specialistPatientsProvider);
    final plansState = ref.read(specialistTreatmentPlansProvider);
    if (patientsState.items.isEmpty) {
      await ref.read(specialistPatientsProvider.notifier).refresh();
    }
    if (!mounted) return;

    final patients = ref.read(specialistPatientsProvider).items;
    final activeIds = _activePatientIds(plansState.items);

    if (patients.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No assigned patients available.')),
      );
      return;
    }

    final selected = await showModalBottomSheet<SpecialistPatientItem>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) {
        return SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              context.dashSpacing,
              0,
              context.dashSpacing,
              context.dashSpacing,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Select patient',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.65),
                ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.sizeOf(context).height * 0.55,
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: patients.length,
                    separatorBuilder: (_, __) =>
                        SizedBox(height: context.dashSpacing * 0.35),
                    itemBuilder: (context, index) {
                      final patient = patients[index];
                      final hasActive = activeIds.contains(patient.id);
                      return ListTile(
                        enabled: !hasActive,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: DashboardColors.border),
                        ),
                        title: Text(patient.name),
                        subtitle: Text(
                          hasActive
                              ? 'This patient already has an active treatment plan.'
                              : 'No active plan',
                        ),
                        trailing: hasActive
                            ? const Icon(Icons.lock_outline)
                            : const Icon(Icons.chevron_right_rounded),
                        onTap: hasActive
                            ? null
                            : () => Navigator.pop(sheetContext, patient),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (selected == null || !mounted) return;
    await _openCreateForPatient(
      patientId: selected.id,
      patientName: selected.name,
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistTreatmentPlansProvider);
    final visible = _visible(state.items);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else {
      body = RefreshIndicator(
        onRefresh: () =>
            ref.read(specialistTreatmentPlansProvider.notifier).refresh(),
        color: DashboardColors.brandCyan,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            if (state.errorMessage != null) ...[
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: () => ref
                    .read(specialistTreatmentPlansProvider.notifier)
                    .refresh(),
              ),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Search by plan title or patient',
                prefixIcon: const Icon(Icons.search_rounded),
                filled: true,
                fillColor: DashboardColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: DashboardColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: DashboardColors.border),
                ),
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            TreatmentPlanFilterChips(
              selected: _filter,
              onChanged: (value) => setState(() => _filter = value),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            if (state.items.isEmpty)
              DashboardSurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'No treatment plans found.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.65),
                    OutlinedButton.icon(
                      onPressed: _openPatientPicker,
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('Add Treatment Plan'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: DashboardColors.brandCyan,
                        side: const BorderSide(color: DashboardColors.brandCyan),
                      ),
                    ),
                  ],
                ),
              )
            else if (visible.isEmpty)
              const DashboardEmptyCard(
                message: 'No plans match your search or filter.',
              )
            else
              ...visible.map(
                (plan) => TreatmentPlanListCard(
                  plan: plan,
                  onTap: plan.id.isEmpty
                      ? () {}
                      : () => context.push(
                          AppRoutes.specialistEditTreatmentPlan(plan.id),
                        ),
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Treatment Plans',
      showBackButton: true,
      actions: [
        IconButton(
          tooltip: 'Add Treatment Plan',
          onPressed: _openPatientPicker,
          icon: const Icon(Icons.add_rounded),
        ),
      ],
      body: body,
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

    return SpecialistPageScaffold(
      title: 'Exercises',
      currentNav: DashboardNavItem.exercises,
      actions: [
        IconButton(
          tooltip: 'Add Exercise',
          onPressed: () async {
            final created = await context.push<bool>(
              AppRoutes.specialistAddExercise,
            );
            if (created == true && context.mounted) {
              await ref.read(specialistExercisesProvider.notifier).refresh();
            }
          },
          icon: const Icon(Icons.add_rounded),
        ),
      ],
      body: ExerciseLibraryBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: notifier.refresh,
        items: state.items,
        searchController: _searchController,
        selectedCategory: _selectedCategory,
        onCategoryChanged: (value) => setState(() => _selectedCategory = value),
        onSearchChanged: (_) => setState(() {}),
        itemBuilder: (context, exercise) => SpecialistExerciseCard(
          exercise: exercise,
          showChevron: true,
          onTap: () =>
              context.push(AppRoutes.specialistExerciseDetails(exercise.id)),
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

    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        appBar: AppBar(
          backgroundColor: DashboardColors.background,
          surfaceTintColor: Colors.transparent,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => context.pop(),
          ),
          automaticallyImplyLeading: true,
          title: Text(
            'Notifications',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          actions: [
            _SpecialistNotificationBellAction(
              count: state.unreadCount,
              onTap: () => context.push(AppRoutes.specialistNotifications),
            ),
            CurrentUserAvatar(
              radius: 18,
              initialsFallback: 'SP',
              onTap: () => context.push(AppRoutes.specialistProfile),
            ),
            SizedBox(width: context.dashSpacing * 0.35),
          ],
        ),
        body: SafeArea(
          child: SpecialistAsyncBody(
            isLoading: state.isLoading,
            errorMessage: state.errorMessage,
            onRetry: () =>
                ref.read(specialistNotificationsProvider.notifier).refresh(),
            isEmpty: state.items.isEmpty,
            emptyMessage: 'No notifications yet.',
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (state.unreadCount > 0)
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: state.isUpdating
                          ? null
                          : () => ref
                                .read(specialistNotificationsProvider.notifier)
                                .markAllAsRead(),
                      child: const Text('Mark all as read'),
                    ),
                  ),
                ...state.items.map(
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
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SpecialistNotificationBellAction extends StatelessWidget {
  const _SpecialistNotificationBellAction({
    required this.count,
    required this.onTap,
  });

  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onTap,
          icon: const Icon(Icons.notifications_none_rounded),
        ),
        if (count > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: DashboardColors.warning,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                count > 9 ? '9+' : '$count',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
      ],
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
            icon: Icons.assignment_ind_outlined,
            label: 'Assigned Case Requests',
            onTap: () => context.push(AppRoutes.specialistCaseRequests),
          ),
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
            backgroundColor: DashboardColors.brandCyan.withValues(alpha: 0.15),
            child: Text(
              dashboardAvatarLetter(review.patientName),
              style: TextStyle(
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
    DashboardColors.brandCyan,
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
            Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
          ],
        ),
      ),
    );
  }
}
