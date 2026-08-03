import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../core/theme/dashboard_theme.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_exercise_assignment_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/exercise_instruction_media_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_widgets.dart';

class SpecialistExerciseDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistExerciseDetailsScreen({
    super.key,
    required this.exerciseId,
    this.useAdminChrome = false,
  });

  final String exerciseId;
  final bool useAdminChrome;

  @override
  ConsumerState<SpecialistExerciseDetailsScreen> createState() =>
      _SpecialistExerciseDetailsScreenState();
}

class _SpecialistExerciseDetailsScreenState
    extends ConsumerState<SpecialistExerciseDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistExerciseDetailProvider(widget.exerciseId).notifier)
          .initialize();
    });
  }

  Future<void> _openEdit(SpecialistExerciseItem exercise) async {
    final updated = await context.push<bool>(
      widget.useAdminChrome
          ? AppRoutes.adminEditExercise(exercise.id)
          : AppRoutes.specialistEditExercise(exercise.id),
    );
    if (!mounted) return;
    if (updated == true) {
      await ref
          .read(specialistExerciseDetailProvider(widget.exerciseId).notifier)
          .refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(
      specialistExerciseDetailProvider(widget.exerciseId),
    );
    final notifier = ref.read(
      specialistExerciseDetailProvider(widget.exerciseId).notifier,
    );
    final auth = ref.watch(authProvider);
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && state.exercise == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.refresh,
        ),
      );
    } else if (state.exercise == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Exercise not found.'),
      );
    } else {
      final exercise = state.exercise!;
      final category = exercise.category?.trim();
      final description = exercise.description?.trim();
      final instructions = exercise.instructions?.trim();
      final canEdit = exercise.canEditBy(
        userId: auth.user?.id,
        role: auth.user?.role,
      );

      body = ListView(
        padding: context.dashPadding,
        children: [
          DashboardSurfaceCard(
            tint: exerciseCategoryIconColor(category),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: context.dashSpacing * 2.6,
                      height: context.dashSpacing * 2.6,
                      decoration: BoxDecoration(
                        color: exerciseCategoryIconBackground(category),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        exerciseCategoryIcon(category),
                        color: exerciseCategoryIconColor(category),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.75),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            exercise.title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: DashboardColors.textPrimary,
                            ),
                          ),
                          if (category != null && category.isNotEmpty) ...[
                            SizedBox(height: context.dashSpacing * 0.4),
                            SpecialistExerciseCategoryBadge(label: category),
                          ],
                          SizedBox(height: context.dashSpacing * 0.35),
                          Text(
                            'Language: ${exercise.languageLabel}',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: DashboardColors.textMuted,
                            ),
                          ),
                          if ((exercise.createdByName ?? '').trim().isNotEmpty) ...[
                            SizedBox(height: context.dashSpacing * 0.35),
                            Text(
                              'Created by ${exercise.createdByName}',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: DashboardColors.textMuted,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                if (canEdit) ...[
                  SizedBox(height: context.dashSpacing * 0.75),
                  OutlinedButton.icon(
                    onPressed: () => _openEdit(exercise),
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Edit Exercise'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: DashboardColors.brandCyan,
                      side: const BorderSide(color: DashboardColors.brandCyan),
                    ),
                  ),
                ],
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _DetailSection(
            title: 'Description',
            body: (description != null && description.isNotEmpty)
                ? description
                : 'No description available.',
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          _DetailSection(
            title: 'Instructions',
            body: (instructions != null && instructions.isNotEmpty)
                ? instructions
                : 'No instructions available.',
          ),
          if (exercise.hasMedia) ...[
            SizedBox(height: context.dashSpacing * 0.65),
            ExerciseInstructionMediaCard(
              mediaUrl: exercise.instructionMediaUrl!,
              title: 'Instruction Media',
            ),
          ],
          SizedBox(height: context.dashSpacing),
        ],
      );
    }

    if (widget.useAdminChrome) {
      return AdminPageScaffold(
        title: 'Exercise Details',
        showBackButton: true,
        showBottomNav: false,
        body: Theme(data: DashboardTheme.light, child: body),
      );
    }

    return SpecialistPageScaffold(
      title: 'Exercise Details',
      showBackButton: true,
      body: body,
    );
  }
}

class _DetailSection extends StatelessWidget {
  const _DetailSection({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          Text(
            body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
