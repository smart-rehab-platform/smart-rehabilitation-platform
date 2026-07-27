import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../specialist/patient_details_widgets.dart';

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
    ScaffoldMessenger.maybeOf(context)?.showSnackBar(
      const SnackBar(content: Text('Reports are unavailable right now.')),
    );
  }

  @override
  Widget build(BuildContext context) {
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
            'Quick Statistics',
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
                  'Goals section is not available yet. Pull to refresh and try again.',
            ),
            onAssignedExercisesTap: () => _scrollToSection(
              _assignedExercisesSectionKey,
              unavailableMessage:
                  'Assigned Exercises section is not available yet. Pull to refresh and try again.',
            ),
            onPendingReviewsTap: () => _scrollToSection(
              _submissionsSectionKey,
              unavailableMessage:
                  'Submissions section is not available yet. Pull to refresh and try again.',
            ),
            onReportsTap: _onReportsTap,
          ),
          SizedBox(height: context.dashSpacing * 1.1),
          Text(
            'Treatment Plan',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (data.treatmentPlan == null)
            PatientDetailsEmptySection(
              message: 'No treatment plan assigned yet.',
              actionLabel: showSpecialistWorkflowActions &&
                      widget.onCreateTreatmentPlan != null
                  ? 'Create Treatment Plan'
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
                  'Goals',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (data.goals.isEmpty)
                  const PatientDetailsEmptySection(
                    message: 'No goals defined for this patient.',
                  )
                else
                  ...data.goals.map(
                    (goal) => Padding(
                      padding:
                          EdgeInsets.only(bottom: context.dashSpacing * 0.6),
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
                    label: const Text('Manage Goals'),
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
                  'Assigned Exercises',
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
                    label: const Text('Assign Exercise'),
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
                  const PatientDetailsEmptySection(
                    message: 'No exercises assigned yet.',
                  )
                else
                  ...data.assignedExercises.map(
                    (exercise) => Padding(
                      padding:
                          EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                      child: PatientAssignedExerciseTile(
                        exercise: exercise,
                        onTap: !showSpecialistWorkflowActions ||
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
                  'Recent Exercise Submissions',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (data.recentSubmissions.isEmpty)
                  const PatientDetailsEmptySection(
                    message: 'No exercise submissions yet.',
                  )
                else
                  ...data.recentSubmissions.map(
                    (submission) => Padding(
                      padding:
                          EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                      child: PatientSubmissionTile(
                        submission: submission,
                        onTap: !showSpecialistWorkflowActions ||
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
            'Latest Specialist Notes',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (data.notes.isEmpty)
            const PatientDetailsEmptySection(
              message: 'No specialist notes yet.',
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
