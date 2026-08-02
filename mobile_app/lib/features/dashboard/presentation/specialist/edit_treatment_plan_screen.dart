import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../providers/specialist_edit_treatment_plan_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'edit_treatment_plan_widgets.dart';
import 'patient_details_widgets.dart';

class SpecialistEditTreatmentPlanScreen extends ConsumerStatefulWidget {
  const SpecialistEditTreatmentPlanScreen({
    super.key,
    required this.planId,
  });

  final String planId;

  @override
  ConsumerState<SpecialistEditTreatmentPlanScreen> createState() =>
      _SpecialistEditTreatmentPlanScreenState();
}

class _SpecialistEditTreatmentPlanScreenState
    extends ConsumerState<SpecialistEditTreatmentPlanScreen> {
  late final TextEditingController _titleController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistEditTreatmentPlanProvider(widget.planId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final notifier =
        ref.read(specialistEditTreatmentPlanProvider(widget.planId).notifier);
    final success = await notifier.save();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Treatment plan updated successfully')),
      );
      context.pop();
      return;
    }

    final current =
        ref.read(specialistEditTreatmentPlanProvider(widget.planId));
    final message = current.validationMessage ?? current.errorMessage;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistEditTreatmentPlanProvider(widget.planId));
    final notifier =
        ref.read(specialistEditTreatmentPlanProvider(widget.planId).notifier);
    final bundle = state.bundle;
    final theme = Theme.of(context);

    ref.listen(specialistEditTreatmentPlanProvider(widget.planId), (prev, next) {
      if (prev?.isLoading == true &&
          !next.isLoading &&
          next.bundle != null &&
          _titleController.text.isEmpty) {
        _titleController.text = next.title;
      }
    });

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.initialize,
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Treatment plan not found.'),
      );
    } else {
      body = SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EditTreatmentPlanPatientHeader(patientName: bundle.patientName),
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
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              'Status',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            PlanStatusSelector(
              status: state.status,
              onChanged: notifier.setStatus,
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
            SizedBox(height: context.dashSpacing * 1.1),
            Text(
              'Current Goals',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            if (bundle.goals.isEmpty)
              const DashboardEmptyCard(message: 'No goals defined for this plan.')
            else
              ...bundle.goals.map(
                (goal) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: PatientGoalCard(goal: goal),
                ),
              ),
            if (state.validationMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              DashboardErrorCard(
                message: state.validationMessage!,
                onRetry: _save,
              ),
            ],
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: _save,
              ),
            ],
            SizedBox(height: context.dashSpacing),
            ElevatedButton(
              onPressed: state.isSaving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: DashboardColors.brandCyan,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(state.isSaving ? 'Saving...' : 'Save Changes'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            OutlinedButton(
              onPressed: state.isSaving ? null : () => context.pop(),
              style: OutlinedButton.styleFrom(
                foregroundColor: DashboardColors.brandCyan,
                side: const BorderSide(color: DashboardColors.brandCyan),
                padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Cancel'),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Edit Treatment Plan',
      showBackButton: true,
      body: body,
    );
  }
}
