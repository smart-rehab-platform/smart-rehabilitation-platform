import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/routes/app_routes.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../specialist/patient_details_widgets.dart';
import '../specialist/patient_diagnosis_section.dart';

/// Shared patient details sections used by Specialist and Admin.
///
/// Owns a single [ScrollController] and stable section [GlobalKey]s so Quick
/// Statistics cards can scroll to in-page sections safely.
class PatientDetailsBody extends StatefulWidget {
  const PatientDetailsBody({
    super.key,
    required this.patientId,
    required this.data,
    this.showSpecialistWorkflowActions = true,
    this.headerActions,
    this.footer,
    this.onAssignExercise,
    this.onReportsTap,
    this.onCreateTreatmentPlan,
    this.familyPatternSection,
  });

  final String patientId;
  final SpecialistPatientDetailsBundle data;
  final bool showSpecialistWorkflowActions;
  final Widget? headerActions;
  final Widget? footer;
  final VoidCallback? onAssignExercise;

  /// Opens the existing reports experience (no dedicated reports section here).
  final VoidCallback? onReportsTap;

  /// Opens create treatment plan when no active plan exists.
  final VoidCallback? onCreateTreatmentPlan;

  /// Optional supplementary section (e.g. specialist family pattern insight).
  final Widget? familyPatternSection;

  @override
  State<PatientDetailsBody> createState() => _PatientDetailsBodyState();
}

class _PatientDetailsBodyState extends State<PatientDetailsBody> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _goalsSectionKey = GlobalKey();
  final GlobalKey _assignedExercisesSectionKey = GlobalKey();
  final GlobalKey _submissionsSectionKey = GlobalKey();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _scrollToSection(
    GlobalKey key, {
    required String unavailableMessage,
  }) async {
    if (!mounted) {
      return;
    }

    final targetContext = key.currentContext;
    if (targetContext == null) {
      final messenger = ScaffoldMessenger.maybeOf(context);
      messenger?.showSnackBar(SnackBar(content: Text(unavailableMessage)));
      return;
    }

    await Scrollable.ensureVisible(
      targetContext,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
      alignment: 0.08,
    );
  }

  void _onReportsTap() {
    if (!mounted) {
      return;
    }
    if (widget.onReportsTap != null) {
      widget.onReportsTap!();
      return;
    }
    final l10n = AppLocalizations.of(context)!;
    ScaffoldMessenger.maybeOf(context)?.showSnackBar(
      SnackBar(content: Text(l10n.specialistPatientDetailsReportsUnavailable)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final data = widget.data;
    final patientId = widget.patientId;
    final showSpecialistWorkflowActions = widget.showSpecialistWorkflowActions;

    return SingleChildScrollView(
      controller: _scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      padding: context.dashPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          PatientDetailsHeader(
            patient: data.patient,
            diagnosis: data.diagnosis,
            overallProgress: data.overallProgress,
          ),
          if (widget.headerActions != null) ...[
            SizedBox(height: context.dashSpacing),
            widget.headerActions!,
          ],
          SizedBox(height: context.dashSpacing),
          Text(
            l10n.specialistPatientDetailsQuickStatistics,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          PatientQuickStatsGrid(
            stats: data.stats,
            onActiveGoalsTap: () => _scrollToSection(
              _goalsSectionKey,
              unavailableMessage:
                  l10n.specialistPatientDetailsGoalsSectionUnavailable,
            ),
            onAssignedExercisesTap: () => _scrollToSection(
              _assignedExercisesSectionKey,
              unavailableMessage: l10n
                  .specialistPatientDetailsAssignedExercisesSectionUnavailable,
            ),
            onPendingReviewsTap: () => _scrollToSection(
              _submissionsSectionKey,
              unavailableMessage:
                  l10n.specialistPatientDetailsSubmissionsSectionUnavailable,
            ),
            onReportsTap: _onReportsTap,
          ),
          SizedBox(height: context.dashSpacing * 1.1),
          PatientDiagnosisSection(
            diagnoses: data.diagnoses,
          ),
          if (widget.familyPatternSection != null) ...[
            SizedBox(height: context.dashSpacing * 1.1),
            widget.familyPatternSection!,
          ],
          SizedBox(height: context.dashSpacing * 1.1),
          Text(
            l10n.clinicalTreatmentPlan,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (data.treatmentPlan == null)
            PatientDetailsEmptySection(
              message: l10n.specialistPatientDetailsNoTreatmentPlanYet,
              actionLabel:
                  showSpecialistWorkflowActions &&
                      widget.onCreateTreatmentPlan != null
                  ? l10n.specialistCreateTreatmentPlan
                  : null,
              onAction: showSpecialistWorkflowActions
                  ? widget.onCreateTreatmentPlan
                  : null,
            )
          else
            PatientTreatmentPlanCard(plan: data.treatmentPlan!),
          SizedBox(height: context.dashSpacing * 1.1),
          KeyedSubtree(
            key: _goalsSectionKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l10n.entityGoals,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (data.goals.isEmpty)
                  PatientDetailsEmptySection(
                    message: l10n.specialistPatientDetailsNoGoals,
                  )
                else
                  ...data.goals.map(
                    (goal) => Padding(
                      padding: EdgeInsets.only(
                        bottom: context.dashSpacing * 0.6,
                      ),
                      child: PatientGoalCard(goal: goal),
                    ),
                  ),
                if (showSpecialistWorkflowActions &&
                    data.treatmentPlan != null) ...[
                  SizedBox(height: context.dashSpacing * 0.5),
                  OutlinedButton.icon(
                    onPressed: () => context.push(
                      AppRoutes.specialistManageGoals(patientId),
                    ),
                    icon: const Icon(Icons.flag_outlined),
                    label: Text(l10n.specialistManageGoals),
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
                  ),
                ],
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          KeyedSubtree(
            key: _assignedExercisesSectionKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l10n.specialistPatientDetailsAssignedExercises,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                if (showSpecialistWorkflowActions &&
                    widget.onAssignExercise != null) ...[
                  SizedBox(height: context.dashSpacing * 0.5),
                  OutlinedButton.icon(
                    onPressed: widget.onAssignExercise,
                    icon: const Icon(Icons.fitness_center_outlined),
                    label: Text(l10n.specialistAssignExercise),
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
                  ),
                ],
                SizedBox(height: context.dashSpacing * 0.5),
                if (data.assignedExercises.isEmpty)
                  PatientDetailsEmptySection(
                    message: l10n.specialistPatientDetailsNoExercises,
                  )
                else
                  ...data.assignedExercises.map(
                    (exercise) => Padding(
                      padding: EdgeInsets.only(
                        bottom: context.dashSpacing * 0.6,
                      ),
                      child: PatientAssignedExerciseTile(
                        exercise: exercise,
                        onTap:
                            !showSpecialistWorkflowActions ||
                                exercise.id.isEmpty
                            ? null
                            : () => context.push(
                                AppRoutes.specialistAssignedExerciseDetails(
                                  exercise.id,
                                ),
                              ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          KeyedSubtree(
            key: _submissionsSectionKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  l10n.specialistPatientDetailsRecentSubmissions,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (data.recentSubmissions.isEmpty)
                  PatientDetailsEmptySection(
                    message: l10n.specialistPatientDetailsNoSubmissions,
                  )
                else
                  ...data.recentSubmissions.map(
                    (submission) => Padding(
                      padding: EdgeInsets.only(
                        bottom: context.dashSpacing * 0.6,
                      ),
                      child: PatientSubmissionTile(
                        submission: submission,
                        onTap:
                            !showSpecialistWorkflowActions ||
                                submission.id.isEmpty
                            ? null
                            : () => context.push(
                                AppRoutes.specialistReviewExercise(
                                  submission.id,
                                ),
                              ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            l10n.specialistPatientDetailsLatestNotes,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (data.notes.isEmpty)
            PatientDetailsEmptySection(
              message: l10n.specialistPatientDetailsNoNotes,
            )
          else
            ...data.notes.map(
              (note) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                child: PatientNoteTile(note: note),
              ),
            ),
          if (widget.footer != null) ...[
            SizedBox(height: context.dashSpacing),
            widget.footer!,
          ],
          SizedBox(height: context.dashSpacing),
        ],
      ),
    );
  }
}
