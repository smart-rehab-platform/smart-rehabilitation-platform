import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_exercise_assignment_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_widgets.dart';

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

  Future<void> _pickStartDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
      initialDate: _startDate,
    );
    if (picked == null || !mounted) {
      return;
    }
    setState(() {
      _startDate = picked;
      if (_dueDate != null && _dueDate!.isBefore(picked)) {
        _dueDate = null;
      }
    });
  }

  Future<void> _pickDueDate() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: _startDate,
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
      initialDate: _dueDate ?? _startDate,
    );
    if (picked == null || !mounted) {
      return;
    }
    setState(() => _dueDate = picked);
  }

  Future<void> _submit() async {
    final messenger = ScaffoldMessenger.of(context);
    final exercise = _selectedExercise;
    if (exercise == null || exercise.id.isEmpty) {
      messenger.showSnackBar(
        const SnackBar(content: Text('Please select an exercise.')),
      );
      return;
    }

    final success = await ref.read(specialistAssignExerciseProvider(_args).notifier).assign(
          exerciseId: exercise.id,
          frequency: _frequency,
          startDate: _startDate,
          dueDate: _dueDate,
        );

    if (!mounted) {
      return;
    }

    if (success) {
      messenger.showSnackBar(
        const SnackBar(content: Text('Exercise assigned successfully')),
      );
      Navigator.of(context).pop(true);
      return;
    }

    final error =
        ref.read(specialistAssignExerciseProvider(_args)).errorMessage;
    if (error != null) {
      messenger.showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.planId.trim().isEmpty) {
      return SpecialistPageScaffold(
        title: 'Assign Exercise',
        showBackButton: true,
        body: Padding(
          padding: context.dashPadding,
          child: const DashboardEmptyCard(
            message:
                'An active treatment plan is required before assigning an exercise.',
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
    final dateFormat = DateFormat('MMM d, yyyy');

    Widget body;
    if (exercisesState.isLoading && exercisesState.items.isEmpty) {
      body = const Center(child: DashboardLoadingCard());
    } else if (exercisesState.errorMessage != null &&
        exercisesState.items.isEmpty) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: exercisesState.errorMessage!,
          onRetry: () =>
              ref.read(specialistExercisesProvider.notifier).refresh(),
        ),
      );
    } else {
      body = ListView(
        padding: context.dashPadding,
        children: [
          Text(
            'Assign Exercise',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            'Choose an exercise, then set frequency and dates.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          buildExerciseSearchField(
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
            const DashboardEmptyCard(
              message: 'No exercises match your search or filter.',
            )
          else
            ...visible.map(
              (exercise) => SpecialistExerciseCard(
                exercise: exercise,
                isSelected: _selectedExercise?.id == exercise.id,
                showChevron: true,
                onTap: () => setState(() => _selectedExercise = exercise),
              ),
            ),
          if (_selectedExercise != null) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            DashboardSurfaceCard(
              tint: DashboardColors.brandCyan,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Selected exercise',
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.brandCyan,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.25),
                  Text(
                    _selectedExercise!.title,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  if ((_selectedExercise!.category ?? '').trim().isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing * 0.25),
                    SpecialistExerciseCategoryBadge(
                      label: _selectedExercise!.category!.trim(),
                    ),
                  ],
                ],
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing),
          Text(
            'Frequency',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ExerciseAssignmentFrequency.values.map((value) {
              final selected = _frequency == value;
              return ChoiceChip(
                label: Text(value.label),
                selected: selected,
                onSelected: assignState.isSubmitting
                    ? null
                    : (_) => setState(() => _frequency = value),
                selectedColor: DashboardColors.brandSoft,
                labelStyle: theme.textTheme.labelLarge?.copyWith(
                  color: selected
                      ? DashboardColors.brandCyan
                      : DashboardColors.textSecondary,
                  fontWeight: FontWeight.w700,
                ),
              );
            }).toList(),
          ),
          SizedBox(height: context.dashSpacing * 0.85),
          Text(
            'Start date',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          OutlinedButton.icon(
            onPressed: assignState.isSubmitting ? null : _pickStartDate,
            icon: const Icon(Icons.calendar_today_outlined),
            label: Text(dateFormat.format(_startDate)),
            style: OutlinedButton.styleFrom(
              foregroundColor: DashboardColors.brandCyan,
              side: const BorderSide(color: DashboardColors.brandCyan),
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.65,
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Due date (optional)',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              if (_dueDate != null)
                TextButton(
                  onPressed: assignState.isSubmitting
                      ? null
                      : () => setState(() => _dueDate = null),
                  child: const Text('Clear'),
                ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          OutlinedButton.icon(
            onPressed: assignState.isSubmitting ? null : _pickDueDate,
            icon: const Icon(Icons.event_outlined),
            label: Text(
              _dueDate == null ? 'Set due date' : dateFormat.format(_dueDate!),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: DashboardColors.brandCyan,
              side: const BorderSide(color: DashboardColors.brandCyan),
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.65,
              ),
            ),
          ),
          if (assignState.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: assignState.errorMessage!,
              onRetry: assignState.isSubmitting ? () {} : _submit,
            ),
          ],
          SizedBox(height: context.dashSpacing),
          ElevatedButton.icon(
            onPressed: assignState.isSubmitting ? null : _submit,
            icon: assignState.isSubmitting
                ? SizedBox(
                    width: context.dashSpacing * 0.55,
                    height: context.dashSpacing * 0.55,
                    child: const CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.assignment_turned_in_outlined),
            label: Text(
              assignState.isSubmitting ? 'Assigning...' : 'Assign Exercise',
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: DashboardColors.brandCyan,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.7,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing),
        ],
      );
    }

    return SpecialistPageScaffold(
      title: 'Assign Exercise',
      showBackButton: true,
      body: PopScope(
        canPop: !assignState.isSubmitting,
        child: body,
      ),
    );
  }
}
