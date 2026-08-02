import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/parent_dashboard_models.dart';
import '../../providers/parent_dashboard_provider.dart';
import '../../providers/parent_features_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/exercise_instruction_media_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import 'parent_exercise_media_picker.dart';
export 'parent_progress_screen.dart';
import 'parent_specialist_feedback_section.dart';
import 'parent_ui_helpers.dart';
import '../communication/communication_patient_actions.dart';

class ParentChildDetailScreen extends ConsumerStatefulWidget {
  const ParentChildDetailScreen({super.key, required this.childId});

  final String childId;

  @override
  ConsumerState<ParentChildDetailScreen> createState() =>
      _ParentChildDetailScreenState();
}

class _ParentChildDetailScreenState
    extends ConsumerState<ParentChildDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentChildDetailProvider(widget.childId).notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentChildDetailProvider(widget.childId));
    final theme = Theme.of(context);
    final child = state.child;

    return ParentPageScaffold(
      title: child?.name ?? 'Child Details',
      showBackButton: true,
      body: ParentAsyncBody(
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
        onRetry: () => ref
            .read(parentChildDetailProvider(widget.childId).notifier)
            .refresh(),
        isEmpty: child == null,
        emptyMessage: 'Child not found.',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DashboardSurfaceCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    child!.name,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  if (child.age != null)
                    Text('Age: ${child.age}', style: theme.textTheme.bodySmall),
                  if (child.dateOfBirth != null)
                    Text(
                      'Date of birth: ${parentFormatDate(child.dateOfBirth)}',
                      style: theme.textTheme.bodySmall,
                    ),
                  if (child.gender != null && child.gender!.isNotEmpty)
                    Text(
                      'Gender: ${child.gender}',
                      style: theme.textTheme.bodySmall,
                    ),
                  if (child.progressPercent != null)
                    Text(
                      'Progress: ${child.progressPercent!.round()}%',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.brandCyan,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing),
            ParentMessageSpecialistButton(childId: widget.childId),
            SizedBox(height: context.dashSpacing),
            ParentSpecialistFeedbackSection(childId: widget.childId),
            SizedBox(height: context.dashSpacing),
            Text('Assigned Exercises', style: theme.textTheme.titleSmall),
            SizedBox(height: context.dashSpacing * 0.5),
            if (state.assignedExercises.isEmpty)
              const DashboardEmptyCard(message: 'No assigned exercises yet.')
            else
              ...state.assignedExercises.map(
                (exercise) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
                  child: DashboardSurfaceCard(
                    child: Text(
                      '${exercise.title}${exercise.frequency != null ? ' • ${exercise.frequency}' : ''}',
                      style: theme.textTheme.bodyMedium,
                    ),
                  ),
                ),
              ),
            SizedBox(height: context.dashSpacing),
            Text('Reports', style: theme.textTheme.titleSmall),
            SizedBox(height: context.dashSpacing * 0.5),
            if (state.reports.isEmpty)
              const DashboardEmptyCard(message: 'No reports yet.')
            else
              ...state.reports
                  .take(3)
                  .map(
                    (report) => Padding(
                      padding: EdgeInsets.only(
                        bottom: context.dashSpacing * 0.5,
                      ),
                      child: DashboardSurfaceCard(
                        onTap:
                            report.pdfUrl != null && report.pdfUrl!.isNotEmpty
                            ? () => parentOpenReportUrl(context, report.pdfUrl)
                            : null,
                        onLongPress:
                            report.pdfUrl != null && report.pdfUrl!.isNotEmpty
                            ? () => parentLongPressReportUrl(
                                context,
                                report.pdfUrl,
                              )
                            : null,
                        child: Text(
                          report.title,
                          style: theme.textTheme.bodyMedium,
                        ),
                      ),
                    ),
                  ),
            SizedBox(height: context.dashSpacing),
            Text('Sessions', style: theme.textTheme.titleSmall),
            SizedBox(height: context.dashSpacing * 0.5),
            if (state.sessions.isEmpty)
              const DashboardEmptyCard(message: 'No sessions scheduled.')
            else
              ...state.sessions.map(
                (session) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
                  child: DashboardSurfaceCard(
                    child: Text(
                      '${session.specialistName ?? 'Specialist'} • ${parentFormatDate(session.scheduledAt)} • ${session.status ?? 'scheduled'}',
                      style: theme.textTheme.bodySmall,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class ParentFeedbackScreen extends ConsumerWidget {
  const ParentFeedbackScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feedback = ref.watch(parentDashboardProvider).latestFeedback;
    final theme = Theme.of(context);

    return ParentPageScaffold(
      title: 'Specialist Feedback',
      showBackButton: true,
      body: feedback == null
          ? const Center(
              child: DashboardEmptyCard(
                message: 'No specialist feedback available yet.',
              ),
            )
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: DashboardSurfaceCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      feedback.specialistName,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (feedback.exerciseTitle != null) ...[
                      SizedBox(height: context.dashSpacing * 0.35),
                      Text(feedback.exerciseTitle!),
                    ],
                    SizedBox(height: context.dashSpacing * 0.5),
                    Text(feedback.message),
                    if (feedback.rating != null) ...[
                      SizedBox(height: context.dashSpacing * 0.5),
                      Text('Rating: ${feedback.rating}/5'),
                    ],
                    if (feedback.requiresRetry) ...[
                      SizedBox(height: context.dashSpacing * 0.5),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: DashboardColors.warning.withValues(
                            alpha: 0.15,
                          ),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          'Retry required',
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: DashboardColors.warning,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
    );
  }
}

class ParentExerciseDetailScreen extends ConsumerStatefulWidget {
  const ParentExerciseDetailScreen({
    super.key,
    required this.assignedExerciseId,
  });

  final String assignedExerciseId;

  @override
  ConsumerState<ParentExerciseDetailScreen> createState() =>
      _ParentExerciseDetailScreenState();
}

class _ParentExerciseDetailScreenState
    extends ConsumerState<ParentExerciseDetailScreen> {
  final _notesController = TextEditingController();
  ParentExerciseMediaSelection? _mediaSelection;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  ParentDailyTask? _findTask(ParentExercisesState state) {
    for (final task in [...state.dailyTasks, ...state.weeklyTasks]) {
      if (task.id == widget.assignedExerciseId) {
        return task;
      }
    }
    return null;
  }

  ParentAssignedExercise? _findAssigned(ParentExercisesState state) {
    for (final item in state.assignedExercises) {
      if (item.id == widget.assignedExerciseId) {
        return item;
      }
    }
    return null;
  }

  void _setMedia(ParentExerciseMediaSelection? selection) {
    setState(() => _mediaSelection = selection);
  }

  Future<void> _openAddMediaSheet() async {
    await showAddExerciseMediaSheet(
      context: context,
      onChooseFiles: () async {
        final selection = await pickExerciseMediaFromFiles();
        if (selection != null && mounted) {
          _setMedia(selection);
        }
      },
      onRecordVideo: () async {
        final selection = await recordExerciseVideo(context);
        if (selection != null && mounted) {
          _setMedia(selection);
        }
      },
      onRecordAudio: () async {
        final selection = await showExerciseAudioRecorderSheet(context);
        if (selection != null && mounted) {
          _setMedia(selection);
        }
      },
      onTakePhoto: () async {
        final selection = await captureExercisePhoto(context);
        if (selection != null && mounted) {
          _setMedia(selection);
        }
      },
    );
  }

  Future<void> _submit() async {
    final error = await ref
        .read(parentExercisesProvider.notifier)
        .submitExercise(
          assignedExerciseId: widget.assignedExerciseId,
          parentNotes: _notesController.text,
          mediaBytes: _mediaSelection?.bytes,
          mediaFilename: _mediaSelection?.filename,
          mediaType: _mediaSelection?.mediaType,
        );
    if (!mounted) {
      return;
    }
    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Exercise submitted successfully')),
    );
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    final exercisesState = ref.watch(parentExercisesProvider);
    final dashboard = ref.watch(parentDashboardProvider);
    final task = _findTask(exercisesState);
    final assigned = _findAssigned(exercisesState);
    final title = task?.title ?? assigned?.title ?? 'Exercise';
    final instructions = task?.instructions ?? assigned?.instructions;
    final instructionMediaUrl = (task?.instructionMediaUrl ??
            assigned?.instructionMediaUrl)
        ?.trim();
    final hasInstructionMedia =
        instructionMediaUrl != null && instructionMediaUrl.isNotEmpty;
    final theme = Theme.of(context);

    return ParentPageScaffold(
      title: title,
      showBackButton: true,
      body: SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (dashboard.selectedChild != null)
              Text(
                'For ${dashboard.selectedChild!.name}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
            SizedBox(height: context.dashSpacing),
            Text(
              'Exercise information',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.55),
            DashboardSurfaceCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Instructions',
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.4),
                  if (instructions != null && instructions.isNotEmpty)
                    Text(
                      instructions,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.45,
                      ),
                    )
                  else
                    Text(
                      'Follow the specialist instructions for this exercise.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                  if (task?.frequency != null ||
                      assigned?.frequency != null) ...[
                    SizedBox(height: context.dashSpacing * 0.55),
                    Text(
                      'Frequency: ${task?.frequency ?? assigned?.frequency}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textMuted,
                      ),
                    ),
                  ],
                  if (task?.dueDate != null || assigned?.dueDate != null) ...[
                    SizedBox(height: context.dashSpacing * 0.35),
                    Text(
                      'Due: ${parentFormatDate(task?.dueDate ?? assigned?.dueDate)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textMuted,
                      ),
                    ),
                  ],
                  if (task?.isCompleted == true) ...[
                    SizedBox(height: context.dashSpacing * 0.5),
                    Text(
                      'Already submitted',
                      style: TextStyle(color: DashboardColors.accent),
                    ),
                  ],
                ],
              ),
            ),
            if (hasInstructionMedia) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              ExerciseInstructionMediaCard(
                mediaUrl: instructionMediaUrl,
              ),
            ],
            SizedBox(height: context.dashSpacing),
            Divider(color: DashboardColors.border),
            SizedBox(height: context.dashSpacing),
            Text(
              'Your Submission',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.55),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Notes for specialist (optional)',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            ParentExerciseMediaSection(
              selection: _mediaSelection,
              onAddMedia: _openAddMediaSheet,
              onRemoveMedia: () => _setMedia(null),
            ),
            SizedBox(height: context.dashSpacing),
            ElevatedButton(
              onPressed:
                  exercisesState.isSubmitting || task?.isCompleted == true
                  ? null
                  : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: DashboardColors.brandCyan,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.75,
                ),
              ),
              child: Text(
                exercisesState.isSubmitting
                    ? 'Submitting...'
                    : 'Submit Exercise',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
