import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_goals_models.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../widgets/dashboard_layout.dart';
import 'edit_treatment_plan_widgets.dart';
import 'patient_details_widgets.dart';

class ManageGoalCard extends StatelessWidget {
  const ManageGoalCard({
    super.key,
    required this.goal,
    required this.onUpdateProgress,
    required this.onEdit,
    required this.onArchive,
    this.isSaving = false,
  });

  final PatientGoalItem goal;
  final VoidCallback onUpdateProgress;
  final VoidCallback onEdit;
  final VoidCallback onArchive;
  final bool isSaving;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PatientGoalCard(goal: goal, showTargets: true),
        SizedBox(height: context.dashSpacing * 0.35),
        Wrap(
          spacing: context.dashSpacing * 0.25,
          runSpacing: context.dashSpacing * 0.25,
          children: [
            _GoalActionButton(
              label: 'Update Progress',
              icon: Icons.trending_up_rounded,
              onPressed: isSaving ? null : onUpdateProgress,
            ),
            _GoalActionButton(
              label: 'Edit Goal',
              icon: Icons.edit_outlined,
              onPressed: isSaving ? null : onEdit,
            ),
            _GoalActionButton(
              label: goal.isAchieved ? 'Achieved' : 'Archive Goal',
              icon: Icons.archive_outlined,
              onPressed: (isSaving || goal.isAchieved) ? null : onArchive,
            ),
          ],
        ),
        if (goal.isAchieved)
          Padding(
            padding: EdgeInsets.only(top: context.dashSpacing * 0.25),
            child: Text(
              'This goal is marked as achieved.',
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ),
      ],
    );
  }
}

class _GoalActionButton extends StatelessWidget {
  const _GoalActionButton({
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: context.dashSpacing * 0.5),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: DashboardColors.brandCyan,
        side: const BorderSide(color: DashboardColors.border),
        padding: EdgeInsets.symmetric(
          horizontal: context.dashSpacing * 0.55,
          vertical: context.dashSpacing * 0.35,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}

class GoalTermSelector extends StatelessWidget {
  const GoalTermSelector({
    super.key,
    required this.term,
    required this.onChanged,
  });

  final GoalTerm term;
  final ValueChanged<GoalTerm> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: GoalTerm.values.map((value) {
        final selected = term == value;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: value == GoalTerm.shortTerm ? context.dashSpacing * 0.35 : 0,
            ),
            child: InkWell(
              onTap: () => onChanged(value),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.55,
                ),
                decoration: BoxDecoration(
                  color: selected
                      ? DashboardColors.brandSoft
                      : DashboardColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: selected
                        ? DashboardColors.brandCyan
                        : DashboardColors.border,
                  ),
                ),
                child: Text(
                  value.label,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: selected
                            ? DashboardColors.brandCyan
                            : DashboardColors.textSecondary,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

InputDecoration goalFieldDecoration(String hint) {
  return InputDecoration(
    hintText: hint,
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
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: DashboardColors.brandCyan),
    ),
  );
}

Future<CreateGoalInput?> showAddGoalDialog(BuildContext context) {
  return showDialog<CreateGoalInput>(
    context: context,
    builder: (dialogContext) => const _AddGoalDialog(),
  );
}

Future<UpdateGoalInput?> showEditGoalDialog(
  BuildContext context, {
  required PatientGoalItem goal,
}) {
  return showDialog<UpdateGoalInput>(
    context: context,
    builder: (dialogContext) => _EditGoalDialog(goal: goal),
  );
}

Future<CreateGoalProgressInput?> showUpdateProgressDialog(
  BuildContext context, {
  required PatientGoalItem goal,
}) {
  return showDialog<CreateGoalProgressInput>(
    context: context,
    builder: (dialogContext) => _UpdateProgressDialog(goal: goal),
  );
}

Future<bool?> showArchiveGoalDialog(BuildContext context) {
  return showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: const Text('Archive Goal'),
      content: const Text(
        'There is no dedicated archive endpoint. This will mark the goal as achieved using PATCH /goals/:id/achieve.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(dialogContext, false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(dialogContext, true),
          child: const Text('Mark as Achieved'),
        ),
      ],
    ),
  );
}

class _AddGoalDialog extends StatefulWidget {
  const _AddGoalDialog();

  @override
  State<_AddGoalDialog> createState() => _AddGoalDialogState();
}

class _AddGoalDialogState extends State<_AddGoalDialog> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _targetValueController = TextEditingController();
  GoalTerm _term = GoalTerm.shortTerm;
  DateTime? _targetDate;
  String? _error;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _targetValueController.dispose();
    super.dispose();
  }

  void _submit() {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _error = 'Goal title is required');
      return;
    }

    final targetValueText = _targetValueController.text.trim();
    double? targetValue;
    if (targetValueText.isNotEmpty) {
      targetValue = double.tryParse(targetValueText);
      if (targetValue == null) {
        setState(() => _error = 'Target value must be a number');
        return;
      }
    }

    Navigator.pop(
      context,
      CreateGoalInput(
        term: _term,
        title: title,
        description: _descriptionController.text.trim(),
        targetDate: _targetDate,
        targetValue: targetValue,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add New Goal'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Goal type',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            GoalTermSelector(
              term: _term,
              onChanged: (value) => setState(() => _term = value),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _titleController,
              decoration: goalFieldDecoration('Goal title'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _targetValueController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: goalFieldDecoration('Target value (optional)'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            PlanDatePickerField(
              label: 'Target date (optional)',
              value: _targetDate,
              allowClear: true,
              onChanged: (date) => setState(() => _targetDate = date),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: goalFieldDecoration('Description (optional)'),
            ),
            if (_error != null) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              Text(
                _error!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: DashboardColors.highPriority,
                    ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _submit,
          child: const Text('Add Goal'),
        ),
      ],
    );
  }
}

class _EditGoalDialog extends StatefulWidget {
  const _EditGoalDialog({required this.goal});

  final PatientGoalItem goal;

  @override
  State<_EditGoalDialog> createState() => _EditGoalDialogState();
}

class _EditGoalDialogState extends State<_EditGoalDialog> {
  late final TextEditingController _titleController;
  late final TextEditingController _targetValueController;
  late DateTime? _targetDate;
  late bool _isAchieved;
  String? _error;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.goal.title);
    _targetValueController = TextEditingController(
      text: widget.goal.targetValue?.toString() ?? '',
    );
    _targetDate = widget.goal.targetDate;
    _isAchieved = widget.goal.isAchieved;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _targetValueController.dispose();
    super.dispose();
  }

  void _submit() {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _error = 'Goal title is required');
      return;
    }

    final targetValueText = _targetValueController.text.trim();
    double? targetValue;
    if (targetValueText.isNotEmpty) {
      targetValue = double.tryParse(targetValueText);
      if (targetValue == null) {
        setState(() => _error = 'Target value must be a number');
        return;
      }
    }

    Navigator.pop(
      context,
      UpdateGoalInput(
        title: title,
        targetDate: _targetDate,
        targetValue: targetValue,
        isAchieved: _isAchieved,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Goal'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _titleController,
              decoration: goalFieldDecoration('Goal title'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _targetValueController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: goalFieldDecoration('Target value (optional)'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            PlanDatePickerField(
              label: 'Target date (optional)',
              value: _targetDate,
              allowClear: true,
              onChanged: (date) => setState(() => _targetDate = date),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Mark as achieved'),
              value: _isAchieved,
              activeThumbColor: DashboardColors.brandCyan,
              onChanged: (value) => setState(() => _isAchieved = value),
            ),
            if (_error != null) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              Text(
                _error!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: DashboardColors.highPriority,
                    ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _submit,
          child: const Text('Save Changes'),
        ),
      ],
    );
  }
}

class _UpdateProgressDialog extends StatefulWidget {
  const _UpdateProgressDialog({required this.goal});

  final PatientGoalItem goal;

  @override
  State<_UpdateProgressDialog> createState() => _UpdateProgressDialogState();
}

class _UpdateProgressDialogState extends State<_UpdateProgressDialog> {
  late final TextEditingController _progressController;
  late final TextEditingController _notesController;
  String? _error;

  @override
  void initState() {
    super.initState();
    final current = (widget.goal.completionPercentage * 100).round();
    _progressController = TextEditingController(text: '$current');
    _notesController = TextEditingController();
  }

  @override
  void dispose() {
    _progressController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submit() {
    final progress = double.tryParse(_progressController.text.trim());
    if (progress == null || progress < 0 || progress > 100) {
      setState(() => _error = 'Enter a progress value between 0 and 100');
      return;
    }

    Navigator.pop(
      context,
      CreateGoalProgressInput(
        completionPercentage: progress,
        notes: _notesController.text,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Update Progress'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              widget.goal.title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _progressController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: goalFieldDecoration('Completion percentage (0–100)'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: goalFieldDecoration('Progress note (optional)'),
            ),
            if (_error != null) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              Text(
                _error!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: DashboardColors.highPriority,
                    ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _submit,
          child: const Text('Save Progress'),
        ),
      ],
    );
  }
}
