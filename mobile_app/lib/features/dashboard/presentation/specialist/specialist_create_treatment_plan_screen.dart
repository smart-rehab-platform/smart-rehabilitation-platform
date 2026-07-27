import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../providers/specialist_create_treatment_plan_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'edit_treatment_plan_widgets.dart';

class SpecialistCreateTreatmentPlanScreen extends ConsumerStatefulWidget {
  const SpecialistCreateTreatmentPlanScreen({
    super.key,
    required this.patientId,
    this.patientName,
  });

  final String patientId;
  final String? patientName;

  @override
  ConsumerState<SpecialistCreateTreatmentPlanScreen> createState() =>
      _SpecialistCreateTreatmentPlanScreenState();
}

class _SpecialistCreateTreatmentPlanScreenState
    extends ConsumerState<SpecialistCreateTreatmentPlanScreen> {
  late final TextEditingController _titleController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistCreateTreatmentPlanProvider.notifier).configure(
            patientId: widget.patientId,
            patientName: widget.patientName ?? 'Patient',
          );
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final messenger = ScaffoldMessenger.of(context);
    final error =
        await ref.read(specialistCreateTreatmentPlanProvider.notifier).create();
    if (!mounted) return;
    if (error != null) {
      messenger.showSnackBar(SnackBar(content: Text(error)));
      return;
    }
    messenger.showSnackBar(
      const SnackBar(content: Text('Treatment plan created successfully')),
    );
    context.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistCreateTreatmentPlanProvider);
    final notifier = ref.read(specialistCreateTreatmentPlanProvider.notifier);
    final theme = Theme.of(context);
    final busy = state.isSaving;

    return SpecialistPageScaffold(
      title: 'Create Treatment Plan',
      showBackButton: true,
      body: SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EditTreatmentPlanPatientHeader(
              patientName: state.patientName.isEmpty
                  ? (widget.patientName ?? 'Patient')
                  : state.patientName,
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Align(
              alignment: Alignment.centerLeft,
              child: DashboardPriorityBadge(label: 'Active'),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'New plans are created as Active.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
            SizedBox(height: context.dashSpacing),
            Text(
              'Plan title',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            buildPlanTitleField(
              controller: _titleController,
              onChanged: notifier.setTitle,
              enabled: !busy,
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            PlanDatePickerField(
              label: 'Start date',
              value: state.startDate,
              onChanged: (date) {
                if (date != null) notifier.setStartDate(date);
              },
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            PlanDatePickerField(
              label: 'End date',
              value: state.endDate,
              allowClear: true,
              onChanged: notifier.setEndDate,
            ),
            if (state.validationMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              Text(
                state.validationMessage!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.highPriority,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: busy ? () {} : _submit,
              ),
            ],
            SizedBox(height: context.dashSpacing),
            ElevatedButton(
              onPressed: busy ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: DashboardColors.brandCyan,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.65,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(busy ? 'Creating...' : 'Create Treatment Plan'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            OutlinedButton(
              onPressed: busy ? null : () => context.pop(false),
              style: OutlinedButton.styleFrom(
                foregroundColor: DashboardColors.brandCyan,
                side: const BorderSide(color: DashboardColors.brandCyan),
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.65,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Cancel'),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      ),
    );
  }
}
