import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_exercise_assignment_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'specialist_exercises_localization_utils.dart';
import 'specialist_exercises_widgets.dart';

typedef AssignExerciseFormState = ({
  ExerciseAssignmentFrequency frequency,
  DateTime startDate,
  DateTime? dueDate,
});

Future<AssignExerciseFormState?> showSpecialistAssignExerciseSheet({
  required BuildContext context,
  required SpecialistExerciseItem exercise,
  required AssignExerciseArgs args,
  required ExerciseAssignmentFrequency initialFrequency,
  required DateTime initialStartDate,
  required DateTime? initialDueDate,
  required Future<bool> Function({
    required ExerciseAssignmentFrequency frequency,
    required DateTime startDate,
    DateTime? dueDate,
  })
  onAssign,
}) {
  return showModalBottomSheet<AssignExerciseFormState>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => SpecialistAssignExerciseSheet(
      exercise: exercise,
      args: args,
      initialFrequency: initialFrequency,
      initialStartDate: initialStartDate,
      initialDueDate: initialDueDate,
      onAssign: ({required frequency, required startDate, dueDate}) => onAssign(
        frequency: frequency,
        startDate: startDate,
        dueDate: dueDate,
      ),
    ),
  );
}

class SpecialistAssignExerciseSheet extends ConsumerStatefulWidget {
  const SpecialistAssignExerciseSheet({
    super.key,
    required this.exercise,
    required this.args,
    required this.initialFrequency,
    required this.initialStartDate,
    required this.initialDueDate,
    required this.onAssign,
  });

  final SpecialistExerciseItem exercise;
  final AssignExerciseArgs args;
  final ExerciseAssignmentFrequency initialFrequency;
  final DateTime initialStartDate;
  final DateTime? initialDueDate;
  final Future<bool> Function({
    required ExerciseAssignmentFrequency frequency,
    required DateTime startDate,
    DateTime? dueDate,
  })
  onAssign;

  @override
  ConsumerState<SpecialistAssignExerciseSheet> createState() =>
      _SpecialistAssignExerciseSheetState();
}

class _SpecialistAssignExerciseSheetState
    extends ConsumerState<SpecialistAssignExerciseSheet> {
  late ExerciseAssignmentFrequency _frequency;
  late DateTime _startDate;
  DateTime? _dueDate;

  @override
  void initState() {
    super.initState();
    _frequency = widget.initialFrequency;
    _startDate = widget.initialStartDate;
    _dueDate = widget.initialDueDate;
  }

  AssignExerciseFormState get _formState =>
      (frequency: _frequency, startDate: _startDate, dueDate: _dueDate);

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

  void _closeSheet() {
    Navigator.of(context).pop(_formState);
  }

  Future<void> _submit() async {
    final success = await widget.onAssign(
      frequency: _frequency,
      startDate: _startDate,
      dueDate: _dueDate,
    );
    if (success && mounted) {
      Navigator.of(context).pop(_formState);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final assignState = ref.watch(
      specialistAssignExerciseProvider(widget.args),
    );
    final isSubmitting = assignState.isSubmitting;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    final dateFormat = DateFormat('MMM d, yyyy');
    final category = widget.exercise.category?.trim() ?? '';

    return PopScope(
      canPop: !isSubmitting,
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.92,
        ),
        decoration: const BoxDecoration(
          color: DashboardColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(
              context.dashPadding.left,
              context.dashSpacing * 0.55,
              context.dashPadding.right,
              context.dashSpacing * 1.1 + bottomInset,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: DashboardColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        l10n.specialistAssignExercise,
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: isSubmitting ? null : _closeSheet,
                      icon: const Icon(Icons.close_rounded),
                      tooltip: l10n.commonClose,
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                DashboardSurfaceCard(
                  tint: DashboardColors.brandCyan,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.specialistAssignExerciseSelectedExercise,
                        style: theme.textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.brandCyan,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.25),
                      Text(
                        widget.exercise.title,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      if (category.isNotEmpty) ...[
                        SizedBox(height: context.dashSpacing * 0.25),
                        SpecialistExerciseCategoryBadge(label: category),
                      ],
                    ],
                  ),
                ),
                SizedBox(height: context.dashSpacing),
                Text(
                  l10n.specialistAssignExerciseFrequency,
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
                      label: Text(
                        localizedExerciseAssignmentFrequency(l10n, value),
                      ),
                      selected: selected,
                      onSelected: isSubmitting
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
                  l10n.specialistPatientDetailsStartDate,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.4),
                OutlinedButton.icon(
                  onPressed: isSubmitting ? null : _pickStartDate,
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
                        l10n.specialistAssignExerciseDueDateOptional,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                    ),
                    if (_dueDate != null)
                      TextButton(
                        onPressed: isSubmitting
                            ? null
                            : () => setState(() => _dueDate = null),
                        child: Text(l10n.commonClear),
                      ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                OutlinedButton.icon(
                  onPressed: isSubmitting ? null : _pickDueDate,
                  icon: const Icon(Icons.event_outlined),
                  label: Text(
                    _dueDate == null
                        ? l10n.specialistAssignExerciseSetDueDate
                        : dateFormat.format(_dueDate!),
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
                    message: mapSpecialistAssignExerciseError(
                      l10n,
                      assignState.errorMessage!,
                    ),
                    onRetry: isSubmitting ? () {} : _submit,
                  ),
                ],
                SizedBox(height: context.dashSpacing),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isSubmitting ? null : _closeSheet,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: DashboardColors.textSecondary,
                          side: const BorderSide(color: DashboardColors.border),
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.62,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(l10n.commonCancel),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.45),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        onPressed: isSubmitting ? null : _submit,
                        icon: isSubmitting
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
                          isSubmitting
                              ? l10n.specialistAssignExerciseAssigning
                              : l10n.specialistAssignExercise,
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DashboardColors.brandCyan,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: DashboardColors.brandCyan
                              .withValues(alpha: 0.45),
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.7,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
