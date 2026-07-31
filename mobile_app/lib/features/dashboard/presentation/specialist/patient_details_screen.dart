import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/parent_links_models.dart';
import '../../providers/parent_links_provider.dart';
import '../../providers/specialist_patient_details_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../communication/communication_patient_actions.dart';
import '../communication/conversations_list_screen.dart';
import '../shared/patient_details_body.dart';
import 'family_pattern_details_sheet.dart';
import 'family_pattern_insight_card.dart';

class SpecialistPatientDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistPatientDetailsScreen({super.key, required this.patientId});

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

  Future<void> _showAddNoteDialog({String? initialText}) async {
    final messenger = ScaffoldMessenger.of(context);
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => _AddSpecialistNoteDialog(
        patientId: widget.patientId,
        messenger: messenger,
        initialText: initialText,
      ),
    );

    if (!mounted) return;
    if (result == true) {
      messenger.showSnackBar(const SnackBar(content: Text('Note saved')));
    }
  }

  PatientGuardianLink? _pickPrimaryGuardian(
    List<PatientGuardianLink> guardians,
  ) {
    if (guardians.isEmpty) {
      return null;
    }
    for (final guardian in guardians) {
      if (guardian.isPrimaryContact) {
        return guardian;
      }
    }
    return guardians.first;
  }

  Future<void> _openParentChatWithDraft(String draftText) async {
    final specialistId = ref.read(authProvider).user?.id;
    if (specialistId == null || specialistId.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign in to send messages.')),
      );
      return;
    }

    final token = ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      ref.read(authRepositoryProvider).setAuthToken(token);
    }

    final guardians = await ref
        .read(parentLinksRepositoryProvider)
        .fetchGuardians(widget.patientId);
    final parent = _pickPrimaryGuardian(guardians);

    if (!mounted) return;

    if (parent == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No parent is linked to this patient yet.'),
        ),
      );
      return;
    }

    await openOrCreateConversation(
      ref: ref,
      context: context,
      patientId: widget.patientId,
      parentId: parent.parentId,
      specialistId: specialistId,
      isParent: false,
      initialDraftMessage: draftText,
    );
  }

  Future<void> _openScheduleFollowUp(String draftNotes) async {
    if (!mounted) return;
    await context.push(
      '${AppRoutes.specialistCreateSession}?patientId=${widget.patientId}',
      extra: draftNotes,
    );
  }

  Future<void> _openFamilyPatternDetails() async {
    final insight = ref
        .read(specialistPatientDetailsProvider(widget.patientId))
        .familyPatternInsight;
    if (insight == null) {
      return;
    }

    final repository = ref.read(specialistPatientDetailsRepositoryProvider);

    await showFamilyPatternDetailsSheet(
      context: context,
      patientId: widget.patientId,
      insight: insight,
      repository: repository,
      onAddClinicalNote: (draft) async {
        if (!mounted) return;
        Navigator.of(context).pop();
        await _showAddNoteDialog(initialText: draft);
      },
      onContactParent: (draft) async {
        if (!mounted) return;
        Navigator.of(context).pop();
        await _openParentChatWithDraft(draft);
      },
      onScheduleFollowUp: (draftNotes) async {
        if (!mounted) return;
        Navigator.of(context).pop();
        await _openScheduleFollowUp(draftNotes);
      },
    );
  }

  Future<void> _openAssignExercise(SpecialistPatientDetailsBundle data) async {
    final messenger = ScaffoldMessenger.of(context);
    final plan = data.treatmentPlan;
    final planId = plan?.id.trim() ?? '';
    final hasActivePlan = plan != null && plan.isActive && planId.isNotEmpty;

    if (!hasActivePlan) {
      messenger.showSnackBar(
        SnackBar(
          content: const Text(
            'An active treatment plan is required before assigning an exercise.',
          ),
          action: SnackBarAction(
            label: 'Plans',
            onPressed: () {
              if (!context.mounted) return;
              context.push(AppRoutes.specialistTreatmentPlans);
            },
          ),
        ),
      );
      return;
    }

    await context.push<bool>(
      AppRoutes.specialistAssignExercise(
        patientId: widget.patientId,
        planId: planId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistPatientDetailsProvider(widget.patientId));
    final data = state.data;

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
        color: DashboardColors.brandCyan,
        child: PatientDetailsBody(
          patientId: widget.patientId,
          data: data,
          familyPatternSection: _buildFamilyPatternSection(state),
          onAssignExercise: () => _openAssignExercise(data),
          onCreateTreatmentPlan: () async {
            final created = await context.push<bool>(
              AppRoutes.specialistCreateTreatmentPlan(
                patientId: widget.patientId,
                patientName: data.patient.fullName,
              ),
            );
            if (!mounted) return;
            if (created == true) {
              await ref
                  .read(
                    specialistPatientDetailsProvider(widget.patientId).notifier,
                  )
                  .refresh();
            }
          },
          onReportsTap: () => context.push(
            AppRoutes.specialistPatientReports(widget.patientId),
          ),
          headerActions: SpecialistMessageParentButton(
            patientId: widget.patientId,
          ),
          footer: _SpecialistActionButtons(
            isSavingNote: state.isSavingNote,
            hasActivePlan: data.treatmentPlan?.isActive == true,
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
            onViewReports: () => context.push(
              AppRoutes.specialistPatientReports(widget.patientId),
            ),
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
            onCreateTreatmentPlan: () async {
              final created = await context.push<bool>(
                AppRoutes.specialistCreateTreatmentPlan(
                  patientId: widget.patientId,
                  patientName: data.patient.fullName,
                ),
              );
              if (!mounted) return;
              if (created == true) {
                await ref
                    .read(
                      specialistPatientDetailsProvider(
                        widget.patientId,
                      ).notifier,
                    )
                    .refresh();
              }
            },
            onAiRecommendations: () => context.push(
              AppRoutes.specialistAiRecommendations(widget.patientId),
            ),
            onSpeechAnalysis: () => context.push(
              AppRoutes.specialistPatientSpeechAnalysis(widget.patientId),
            ),
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

  Widget? _buildFamilyPatternSection(SpecialistPatientDetailsState state) {
    if (state.familyPatternLoading) {
      return const FamilyPatternInsightLoadingCard();
    }

    if (state.familyPatternLoadFailed) {
      return FamilyPatternInsightRetryCard(
        onRetry: () => ref
            .read(specialistPatientDetailsProvider(widget.patientId).notifier)
            .retryFamilyPatternInsight(),
      );
    }

    final insight = state.familyPatternInsight;
    if (insight == null) {
      return null;
    }

    return FamilyPatternInsightCard(
      insight: insight,
      onReviewMatchedChildren: _openFamilyPatternDetails,
    );
  }
}

class _SpecialistActionButtons extends StatelessWidget {
  const _SpecialistActionButtons({
    required this.isSavingNote,
    required this.hasActivePlan,
    required this.onReviewExercises,
    required this.onAddNote,
    required this.onViewReports,
    required this.onEditTreatmentPlan,
    required this.onCreateTreatmentPlan,
    required this.onAiRecommendations,
    required this.onSpeechAnalysis,
  });

  final bool isSavingNote;
  final bool hasActivePlan;
  final VoidCallback onReviewExercises;
  final VoidCallback onAddNote;
  final VoidCallback onViewReports;
  final VoidCallback onEditTreatmentPlan;
  final VoidCallback onCreateTreatmentPlan;
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
            foregroundColor: DashboardColors.brandCyan,
            side: const BorderSide(color: DashboardColors.brandCyan),
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
            backgroundColor: DashboardColors.brandCyan,
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
            foregroundColor: DashboardColors.brandCyan,
            side: const BorderSide(color: DashboardColors.brandCyan),
            padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        if (hasActivePlan)
          OutlinedButton.icon(
            onPressed: onEditTreatmentPlan,
            icon: const Icon(Icons.edit_note_outlined),
            label: const Text('Edit Treatment Plan'),
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
          )
        else
          OutlinedButton.icon(
            onPressed: onCreateTreatmentPlan,
            icon: const Icon(Icons.playlist_add_check_rounded),
            label: const Text('Create Treatment Plan'),
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
        SizedBox(height: context.dashSpacing * 0.5),
        OutlinedButton.icon(
          onPressed: onAiRecommendations,
          icon: const Icon(Icons.auto_awesome_outlined),
          label: const Text('AI Recommendations'),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.brandCyan,
            side: const BorderSide(color: DashboardColors.brandCyan),
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
            foregroundColor: DashboardColors.brandCyan,
            side: const BorderSide(color: DashboardColors.brandCyan),
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

class _AddSpecialistNoteDialog extends ConsumerStatefulWidget {
  const _AddSpecialistNoteDialog({
    required this.patientId,
    required this.messenger,
    this.initialText,
  });

  final String patientId;
  final ScaffoldMessengerState messenger;
  final String? initialText;

  @override
  ConsumerState<_AddSpecialistNoteDialog> createState() =>
      _AddSpecialistNoteDialogState();
}

class _AddSpecialistNoteDialogState
    extends ConsumerState<_AddSpecialistNoteDialog> {
  late final TextEditingController _controller;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialText ?? '');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _cancel() {
    if (_saving) return;
    FocusManager.instance.primaryFocus?.unfocus();
    Navigator.of(context).pop(false);
  }

  Future<void> _save() async {
    if (_saving) return;

    FocusManager.instance.primaryFocus?.unfocus();
    setState(() => _saving = true);

    final error = await ref
        .read(specialistPatientDetailsProvider(widget.patientId).notifier)
        .addNote(_controller.text);

    if (!mounted) return;

    if (error != null) {
      setState(() => _saving = false);
      widget.messenger.showSnackBar(SnackBar(content: Text(error)));
      return;
    }

    Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Specialist Note'),
      content: TextField(
        controller: _controller,
        maxLines: 4,
        enabled: !_saving,
        decoration: const InputDecoration(
          hintText: 'Enter clinical note...',
          border: OutlineInputBorder(),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saving ? null : _cancel,
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _saving ? null : _save,
          child: Text(_saving ? 'Saving...' : 'Save'),
        ),
      ],
    );
  }
}
