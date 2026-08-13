import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../providers/specialist_create_treatment_plan_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'edit_treatment_plan_widgets.dart';
import 'specialist_treatment_plans_goals_localization_utils.dart';

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
      ref
          .read(specialistCreateTreatmentPlanProvider.notifier)
          .configure(
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
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);
    final error = await ref
        .read(specialistCreateTreatmentPlanProvider.notifier)
        .create();
    if (!mounted) return;
    if (error != null) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(mapSpecialistCreateTreatmentPlanError(l10n, error)),
        ),
      );
      return;
    }
    messenger.showSnackBar(
      SnackBar(content: Text(l10n.specialistTreatmentPlanCreatedSuccess)),
    );
    context.pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(specialistCreateTreatmentPlanProvider);
    final notifier = ref.read(specialistCreateTreatmentPlanProvider.notifier);
    final theme = Theme.of(context);
    final busy = state.isSaving;

    return SpecialistPageScaffold(
      title: l10n.specialistCreateTreatmentPlan,
      showBackButton: true,
      body: SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EditTreatmentPlanPatientHeader(
              patientName: state.patientName.isEmpty
                  ? (widget.patientName ?? l10n.entityPatient)
                  : state.patientName,
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: DashboardPriorityBadge(label: l10n.statusActive),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              l10n.specialistTreatmentPlanNewPlansActiveHelper,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
            SizedBox(height: context.dashSpacing),
            Text(
              l10n.specialistTreatmentPlanTitleLabel,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            buildPlanTitleField(
              controller: _titleController,
              onChanged: notifier.setTitle,
              hint: l10n.specialistTreatmentPlanTitleHint,
              enabled: !busy,
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            PlanDatePickerField(
              label: l10n.specialistPatientDetailsStartDate,
              value: state.startDate,
              onChanged: (date) {
                if (date != null) notifier.setStartDate(date);
              },
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            PlanDatePickerField(
              label: l10n.specialistPatientDetailsEndDate,
              value: state.endDate,
              allowClear: true,
              onChanged: notifier.setEndDate,
            ),
            if (state.validationMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              Text(
                mapSpecialistTreatmentPlanValidation(
                  l10n,
                  state.validationMessage!,
                ),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.highPriority,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              DashboardErrorCard(
                message: mapSpecialistCreateTreatmentPlanError(
                  l10n,
                  state.errorMessage!,
                ),
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
              child: Text(
                busy
                    ? l10n.specialistTreatmentPlanCreating
                    : l10n.specialistCreateTreatmentPlan,
              ),
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
              child: Text(l10n.commonCancel),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      ),
    );
  }
}
