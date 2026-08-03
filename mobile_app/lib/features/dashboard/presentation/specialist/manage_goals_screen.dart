import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../providers/specialist_goals_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'edit_treatment_plan_widgets.dart';
import 'manage_goals_widgets.dart';
import 'specialist_treatment_plans_goals_localization_utils.dart';

class SpecialistManageGoalsScreen extends ConsumerStatefulWidget {
  const SpecialistManageGoalsScreen({super.key, required this.patientId});

  final String patientId;

  @override
  ConsumerState<SpecialistManageGoalsScreen> createState() =>
      _SpecialistManageGoalsScreenState();
}

class _SpecialistManageGoalsScreenState
    extends ConsumerState<SpecialistManageGoalsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistGoalsProvider(widget.patientId).notifier).initialize();
    });
  }

  Future<void> _handleAddGoal() async {
    final l10n = AppLocalizations.of(context)!;
    final input = await showAddGoalDialog(context);
    if (!mounted || input == null) return;

    final success = await ref
        .read(specialistGoalsProvider(widget.patientId).notifier)
        .createGoal(input);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistGoalsCreatedSuccess)),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  Future<void> _handleEditGoal(PatientGoalItem goal) async {
    final l10n = AppLocalizations.of(context)!;
    final input = await showEditGoalDialog(context, goal: goal);
    if (!mounted || input == null) return;

    final success = await ref
        .read(specialistGoalsProvider(widget.patientId).notifier)
        .updateGoal(goal.id, input);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistGoalsUpdatedSuccess)),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  Future<void> _handleUpdateProgress(PatientGoalItem goal) async {
    final l10n = AppLocalizations.of(context)!;
    final input = await showUpdateProgressDialog(context, goal: goal);
    if (!mounted || input == null) return;

    final success = await ref
        .read(specialistGoalsProvider(widget.patientId).notifier)
        .updateProgress(goal.id, input);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistGoalsProgressUpdatedSuccess)),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  Future<void> _handleArchiveGoal(PatientGoalItem goal) async {
    final l10n = AppLocalizations.of(context)!;
    final confirmed = await showArchiveGoalDialog(context);
    if (!mounted || confirmed != true) return;

    final success = await ref
        .read(specialistGoalsProvider(widget.patientId).notifier)
        .archiveGoal(goal.id);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistGoalsMarkedAchievedSuccess)),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  void _showErrorSnackBar() {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.read(specialistGoalsProvider(widget.patientId));
    final message = state.validationMessage ?? state.errorMessage;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapSpecialistGoalsActionError(l10n, message))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(specialistGoalsProvider(widget.patientId));
    final notifier = ref.read(
      specialistGoalsProvider(widget.patientId).notifier,
    );
    final bundle = state.bundle;
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapSpecialistGoalsLoadError(l10n, state.errorMessage!),
          onRetry: notifier.initialize,
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardEmptyCard(message: l10n.specialistGoalsCouldNotLoad),
      );
    } else if (bundle.planId.isEmpty) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: l10n.specialistGoalsNoActivePlanForPatient,
          onRetry: notifier.initialize,
        ),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.brandCyan,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              EditTreatmentPlanPatientHeader(patientName: bundle.patientName),
              SizedBox(height: context.dashSpacing * 0.35),
              Text(
                bundle.planTitle,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.dashSpacing),
              Text(
                l10n.entityGoals,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              if (bundle.goals.isEmpty)
                DashboardEmptyCard(message: l10n.specialistGoalsNoGoalsForPlan)
              else
                ...bundle.goals.map(
                  (goal) => Padding(
                    padding: EdgeInsets.only(
                      bottom: context.dashSpacing * 0.75,
                    ),
                    child: ManageGoalCard(
                      goal: goal,
                      isSaving: state.isSaving,
                      onUpdateProgress: () => _handleUpdateProgress(goal),
                      onEdit: () => _handleEditGoal(goal),
                      onArchive: () => _handleArchiveGoal(goal),
                    ),
                  ),
                ),
              SizedBox(height: context.dashSpacing * 0.5),
              ElevatedButton.icon(
                onPressed: state.isSaving ? null : _handleAddGoal,
                icon: const Icon(Icons.add_rounded),
                label: Text(
                  state.isSaving
                      ? l10n.commonSaving
                      : l10n.specialistGoalsAddNewGoal,
                ),
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
              ),
              SizedBox(height: context.dashSpacing),
            ],
          ),
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.specialistManageGoals,
      showBackButton: true,
      body: body,
    );
  }
}
