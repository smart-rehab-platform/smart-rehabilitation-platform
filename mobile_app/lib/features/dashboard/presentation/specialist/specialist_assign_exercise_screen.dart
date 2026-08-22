import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_exercise_assignment_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_assign_exercise_sheet.dart';
import 'specialist_exercises_localization_utils.dart';
import 'specialist_exercises_widgets.dart';
import 'specialist_scoped_localization_utils.dart';

class SpecialistAssignExerciseScreen extends ConsumerStatefulWidget {
  const SpecialistAssignExerciseScreen({
    super.key,
    required this.patientId,
    required this.planId,
  });

  final String patientId;
  final String planId;

  @override
  ConsumerState<SpecialistAssignExerciseScreen> createState() =>
      _SpecialistAssignExerciseScreenState();
}

class _SpecialistAssignExerciseScreenState
    extends ConsumerState<SpecialistAssignExerciseScreen> {
  late final TextEditingController _searchController;
  late final AssignExerciseArgs _args;

  String _selectedCategory = specialistExerciseAllCategoryLabel;
  SpecialistExerciseItem? _selectedExercise;
  ExerciseAssignmentFrequency _frequency = ExerciseAssignmentFrequency.daily;
  DateTime _startDate = DateTime.now();
  DateTime? _dueDate;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _args = (patientId: widget.patientId, planId: widget.planId);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistExercisesProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<bool> _submit({
    required SpecialistExerciseItem exercise,
    required ExerciseAssignmentFrequency frequency,
    required DateTime startDate,
    DateTime? dueDate,
  }) async {
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);

    if (exercise.id.isEmpty) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistAssignExerciseSelectRequired)),
      );
      return false;
    }

    final success = await ref
        .read(specialistAssignExerciseProvider(_args).notifier)
        .assign(
          exerciseId: exercise.id,
          frequency: frequency,
          startDate: startDate,
          dueDate: dueDate,
        );

    if (!mounted) {
      return success;
    }

    if (success) {
      return true;
    }

    final error = ref
        .read(specialistAssignExerciseProvider(_args))
        .errorMessage;
    if (error != null) {
      messenger.showSnackBar(
        SnackBar(content: Text(mapSpecialistAssignExerciseError(l10n, error))),
      );
    }
    return false;
  }

  Future<void> _onExerciseTap(SpecialistExerciseItem exercise) async {
    setState(() => _selectedExercise = exercise);

    var assignmentSucceeded = false;
    final formState = await showSpecialistAssignExerciseSheet(
      context: context,
      exercise: exercise,
      args: _args,
      initialFrequency: _frequency,
      initialStartDate: _startDate,
      initialDueDate: _dueDate,
      onAssign: ({required frequency, required startDate, dueDate}) async {
        final success = await _submit(
          exercise: exercise,
          frequency: frequency,
          startDate: startDate,
          dueDate: dueDate,
        );
        assignmentSucceeded = success;
        return success;
      },
    );

    if (!mounted) {
      return;
    }

    if (assignmentSucceeded) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(context)!.specialistAssignExerciseSuccess,
          ),
        ),
      );
      Navigator.of(context).pop(true);
      return;
    }

    if (formState == null) {
      return;
    }

    setState(() {
      _frequency = formState.frequency;
      _startDate = formState.startDate;
      _dueDate = formState.dueDate;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    if (widget.planId.trim().isEmpty) {
      return SpecialistPageScaffold(
        title: l10n.specialistAssignExercise,
        showBackButton: true,
        body: Padding(
          padding: context.dashPadding,
          child: DashboardEmptyCard(
            message: l10n.specialistPatientDetailsActivePlanRequired,
          ),
        ),
      );
    }

    final exercisesState = ref.watch(specialistExercisesProvider);
    final assignState = ref.watch(specialistAssignExerciseProvider(_args));
    final theme = Theme.of(context);
    final categories = buildExerciseCategoryFilters(exercisesState.items);
    final visible = filterExercises(
      exercisesState.items,
      searchQuery: _searchController.text,
      selectedCategory: _selectedCategory,
    );

    Widget body;
    if (exercisesState.isLoading && exercisesState.items.isEmpty) {
      body = const Center(child: DashboardLoadingCard());
    } else if (exercisesState.errorMessage != null &&
        exercisesState.items.isEmpty) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapSpecialistExercisesError(
            l10n,
            exercisesState.errorMessage!,
          ),
          onRetry: () =>
              ref.read(specialistExercisesProvider.notifier).refresh(),
        ),
      );
    } else {
      body = ListView(
        padding: context.dashPadding,
        children: [
          Text(
            l10n.specialistAssignExerciseSubtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          buildExerciseSearchField(
            context: context,
            controller: _searchController,
            onChanged: (_) => setState(() {}),
          ),
          if (exercisesState.items.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            SpecialistExerciseCategoryChips(
              categories: categories,
              selected: _selectedCategory,
              onChanged: (value) => setState(() => _selectedCategory = value),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.75),
          if (visible.isEmpty)
            DashboardEmptyCard(
              message: l10n.specialistAssignExerciseNoMatchSearch,
            )
          else
            ...visible.map(
              (exercise) => SpecialistExerciseCard(
                exercise: exercise,
                isSelected: _selectedExercise?.id == exercise.id,
                showChevron: true,
                onTap: () => _onExerciseTap(exercise),
              ),
            ),
          SizedBox(height: context.dashSpacing),
        ],
      );
    }

    return SpecialistPageScaffold(
      title: l10n.specialistAssignExercise,
      showBackButton: true,
      body: PopScope(canPop: !assignState.isSubmitting, child: body),
    );
  }
}
