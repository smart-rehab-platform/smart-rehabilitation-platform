import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../providers/specialist_patient_details_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'patient_details_widgets.dart';

class SpecialistPatientDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistPatientDetailsScreen({
    super.key,
    required this.patientId,
  });

  final String patientId;

  @override
  ConsumerState<SpecialistPatientDetailsScreen> createState() =>
      _SpecialistPatientDetailsScreenState();
}

class _SpecialistPatientDetailsScreenState
    extends ConsumerState<SpecialistPatientDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistPatientDetailsProvider(widget.patientId).notifier)
          .initialize();
    });
  }

  Future<void> _showAddNoteDialog() async {
    final controller = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        var isSaving = false;

        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Add Specialist Note'),
              content: TextField(
                controller: controller,
                maxLines: 4,
                enabled: !isSaving,
                decoration: const InputDecoration(
                  hintText: 'Enter clinical note...',
                  border: OutlineInputBorder(),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isSaving ? null : () => Navigator.pop(dialogContext, false),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: isSaving
                      ? null
                      : () async {
                          setDialogState(() => isSaving = true);
                          final error = await ref
                              .read(
                                specialistPatientDetailsProvider(
                                  widget.patientId,
                                ).notifier,
                              )
                              .addNote(controller.text);
                          if (!dialogContext.mounted) return;
                          if (error != null) {
                            setDialogState(() => isSaving = false);
                            ScaffoldMessenger.of(dialogContext).showSnackBar(
                              SnackBar(content: Text(error)),
                            );
                            return;
                          }
                          Navigator.pop(dialogContext, true);
                        },
                  child: Text(isSaving ? 'Saving...' : 'Save'),
                ),
              ],
            );
          },
        );
      },
    );

    if (!mounted) return;
    if (result == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Note saved')),
      );
    }
    controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistPatientDetailsProvider(widget.patientId));
    final data = state.data;
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && data == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: () => ref
              .read(specialistPatientDetailsProvider(widget.patientId).notifier)
              .refresh(),
        ),
      );
    } else if (data == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Patient not found.'),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: () => ref
            .read(specialistPatientDetailsProvider(widget.patientId).notifier)
            .refresh(),
        color: DashboardColors.primary,
        child: SingleChildScrollView(
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
              SizedBox(height: context.dashSpacing),
              Text(
                'Quick Statistics',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              PatientQuickStatsGrid(stats: data.stats),
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
                const PatientDetailsEmptySection(
                  message: 'No treatment plan assigned yet.',
                )
              else
                PatientTreatmentPlanCard(plan: data.treatmentPlan!),
              SizedBox(height: context.dashSpacing * 1.1),
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
                    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                    child: PatientGoalCard(goal: goal),
                  ),
                ),
              if (data.treatmentPlan != null) ...[
                SizedBox(height: context.dashSpacing * 0.5),
                OutlinedButton.icon(
                  onPressed: () => context.push(
                    AppRoutes.specialistManageGoals(widget.patientId),
                  ),
                  icon: const Icon(Icons.flag_outlined),
                  label: const Text('Manage Goals'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: DashboardColors.primary,
                    side: const BorderSide(color: DashboardColors.primary),
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
              Text(
                'Assigned Exercises',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              if (data.assignedExercises.isEmpty)
                const PatientDetailsEmptySection(
                  message: 'No exercises assigned yet.',
                )
              else
                ...data.assignedExercises.map(
                  (exercise) => Padding(
                    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                    child: PatientAssignedExerciseTile(exercise: exercise),
                  ),
                ),
              SizedBox(height: context.dashSpacing * 0.5),
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
                    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                    child: PatientSubmissionTile(
                      submission: submission,
                      onTap: submission.id.isEmpty
                          ? null
                          : () => context.push(
                                AppRoutes.specialistReviewExercise(submission.id),
                              ),
                    ),
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
              SizedBox(height: context.dashSpacing),
              _ActionButtons(
                isSavingNote: state.isSavingNote,
                onReviewExercises: () {
                  final pending = data.recentSubmissions
                      .where((s) => s.reviewStatus == 'Pending')
                      .toList();
                  if (pending.isNotEmpty && pending.first.id.isNotEmpty) {
                    context.push(
                      AppRoutes.specialistReviewExercise(pending.first.id),
                    );
                  } else {
                    context.push(AppRoutes.specialistPendingReviews);
                  }
                },
                onAddNote: _showAddNoteDialog,
                onViewReports: () => context.push(AppRoutes.specialistReports),
                onEditTreatmentPlan: () {
                  final planId = data.treatmentPlan?.id;
                  if (planId != null && planId.isNotEmpty) {
                    context.push(AppRoutes.specialistEditTreatmentPlan(planId));
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('No treatment plan found for this patient.'),
                      ),
                    );
                  }
                },
                onAiRecommendations: () => context.push(
                  AppRoutes.specialistAiRecommendations(widget.patientId),
                ),
                onSpeechAnalysis: () => context.push(
                  AppRoutes.specialistPatientSpeechAnalysis(widget.patientId),
                ),
              ),
              SizedBox(height: context.dashSpacing),
            ],
          ),
        ),
      );
    }

    return SpecialistPageScaffold(
      title: data?.patient.fullName ?? 'Patient Details',
      showBackButton: true,
      body: body,
    );
  }
}

class _ActionButtons extends StatelessWidget {
  const _ActionButtons({
    required this.isSavingNote,
    required this.onReviewExercises,
    required this.onAddNote,
    required this.onViewReports,
    required this.onEditTreatmentPlan,
    required this.onAiRecommendations,
    required this.onSpeechAnalysis,
  });

  final bool isSavingNote;
  final VoidCallback onReviewExercises;
  final VoidCallback onAddNote;
  final VoidCallback onViewReports;
  final VoidCallback onEditTreatmentPlan;
  final VoidCallback onAiRecommendations;
  final VoidCallback onSpeechAnalysis;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OutlinedButton.icon(
          onPressed: onReviewExercises,
          icon: const Icon(Icons.rate_review_outlined),
          label: const Text('Review Exercises'),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.primary,
            side: const BorderSide(color: DashboardColors.primary),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        ElevatedButton.icon(
          onPressed: isSavingNote ? null : onAddNote,
          icon: const Icon(Icons.note_add_outlined),
          label: Text(isSavingNote ? 'Saving...' : 'Add Specialist Note'),
          style: ElevatedButton.styleFrom(
            backgroundColor: DashboardColors.primary,
            foregroundColor: Colors.white,
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        OutlinedButton.icon(
          onPressed: onViewReports,
          icon: const Icon(Icons.description_outlined),
          label: const Text('View Reports'),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.primary,
            side: const BorderSide(color: DashboardColors.primary),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        OutlinedButton.icon(
          onPressed: onEditTreatmentPlan,
          icon: const Icon(Icons.edit_note_outlined),
          label: const Text('Edit Treatment Plan'),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.primary,
            side: const BorderSide(color: DashboardColors.primary),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        OutlinedButton.icon(
          onPressed: onAiRecommendations,
          icon: const Icon(Icons.auto_awesome_outlined),
          label: const Text('AI Recommendations'),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.primary,
            side: const BorderSide(color: DashboardColors.primary),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        OutlinedButton.icon(
          onPressed: onSpeechAnalysis,
          icon: const Icon(Icons.graphic_eq_rounded),
          label: const Text('Speech Analysis'),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.primary,
            side: const BorderSide(color: DashboardColors.primary),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
      ],
    );
  }
}
