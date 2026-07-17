import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../core/services/api_client.dart';
import '../../../../core/utils/api_response_parser.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/exercise_instruction_media_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_widgets.dart';

class SpecialistAssignedExerciseDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistAssignedExerciseDetailsScreen({
    super.key,
    required this.assignedExerciseId,
  });

  final String assignedExerciseId;

  @override
  ConsumerState<SpecialistAssignedExerciseDetailsScreen> createState() =>
      _SpecialistAssignedExerciseDetailsScreenState();
}

class _SpecialistAssignedExerciseDetailsScreenState
    extends ConsumerState<SpecialistAssignedExerciseDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(
            specialistAssignedExerciseDetailProvider(
              widget.assignedExerciseId,
            ).notifier,
          )
          .initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(
      specialistAssignedExerciseDetailProvider(widget.assignedExerciseId),
    );
    final notifier = ref.read(
      specialistAssignedExerciseDetailProvider(
        widget.assignedExerciseId,
      ).notifier,
    );
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && state.assignment == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.refresh,
        ),
      );
    } else if (state.assignment == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Assigned exercise not found.'),
      );
    } else {
      final assignment = state.assignment!;
      final category = assignment.category?.trim();
      final description = assignment.description?.trim();
      final instructions = assignment.instructions?.trim();
      final dateFmt = DateFormat('MMM d, yyyy');

      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.primary,
        child: ListView(
          padding: context.dashPadding,
          children: [
            DashboardSurfaceCard(
              tint: exerciseCategoryIconColor(category),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: context.dashSpacing * 2.6,
                    height: context.dashSpacing * 2.6,
                    decoration: BoxDecoration(
                      color: exerciseCategoryIconBackground(category),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      exerciseCategoryIcon(category),
                      color: exerciseCategoryIconColor(category),
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.75),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          assignment.exerciseTitle,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                        if (category != null && category.isNotEmpty) ...[
                          SizedBox(height: context.dashSpacing * 0.4),
                          SpecialistExerciseCategoryBadge(label: category),
                        ],
                        SizedBox(height: context.dashSpacing * 0.4),
                        DashboardPriorityBadge(label: assignment.statusLabel),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            _SectionCard(
              title: 'Description',
              body: (description != null && description.isNotEmpty)
                  ? description
                  : 'No description available.',
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            _SectionCard(
              title: 'Instructions',
              body: (instructions != null && instructions.isNotEmpty)
                  ? instructions
                  : 'No instructions available.',
            ),
            if (assignment.hasInstructionMedia) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              ExerciseInstructionMediaCard(
                mediaUrl: assignment.instructionMediaUrl!,
                title: 'Instructional Media',
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.65),
            DashboardSurfaceCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Assignment',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.45),
                  _MetaRow(
                    label: 'Status',
                    value: assignment.statusLabel,
                  ),
                  _MetaRow(
                    label: 'Frequency',
                    value: assignment.frequency?.trim().isNotEmpty == true
                        ? assignment.frequency!
                        : '—',
                  ),
                  _MetaRow(
                    label: 'Assigned',
                    value: assignment.createdAt != null
                        ? dateFmt.format(assignment.createdAt!)
                        : assignment.startDate != null
                            ? dateFmt.format(assignment.startDate!)
                            : '—',
                  ),
                  _MetaRow(
                    label: 'Due date',
                    value: assignment.dueDate != null
                        ? dateFmt.format(assignment.dueDate!)
                        : 'No due date',
                  ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Text(
              'Latest Submission',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.45),
            if (state.latestSubmission == null)
              const DashboardEmptyCard(
                message: 'No submissions for this assignment yet.',
              )
            else
              DashboardSurfaceCard(
                onTap: state.latestSubmission!.id.isEmpty
                    ? null
                    : () => context.push(
                          AppRoutes.specialistReviewExercise(
                            state.latestSubmission!.id,
                          ),
                        ),
                child: Row(
                  children: [
                    Icon(
                      Icons.rate_review_outlined,
                      color: DashboardColors.primary,
                    ),
                    SizedBox(width: context.dashSpacing * 0.65),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            state.latestSubmission!.reviewStatus,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            state.latestSubmission!.submittedAt != null
                                ? DateFormat('MMM d, yyyy • h:mm a').format(
                                    state.latestSubmission!.submittedAt!,
                                  )
                                : 'Recently submitted',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (state.latestSubmission!.id.isNotEmpty)
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: DashboardColors.textMuted,
                      ),
                  ],
                ),
              ),
            if ((assignment.exerciseId ?? '').isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              OutlinedButton.icon(
                onPressed: () => context.push(
                  AppRoutes.specialistExerciseDetails(assignment.exerciseId!),
                ),
                icon: const Icon(Icons.menu_book_outlined),
                label: const Text('Open library exercise'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.primary,
                  side: const BorderSide(color: DashboardColors.primary),
                ),
              ),
            ],
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Assigned Exercise',
      showBackButton: true,
      body: body,
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          Text(
            body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  const _MetaRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.3),
      child: Row(
        children: [
          SizedBox(
            width: 96,
            child: Text(
              label,
              style: theme.textTheme.labelMedium?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SpecialistAssignedExerciseDetailState {
  const SpecialistAssignedExerciseDetailState({
    this.isLoading = false,
    this.errorMessage,
    this.assignment,
    this.latestSubmission,
  });

  final bool isLoading;
  final String? errorMessage;
  final PatientAssignedExerciseItem? assignment;
  final PatientSubmissionItem? latestSubmission;

  SpecialistAssignedExerciseDetailState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    Object? assignment = _sentinel,
    Object? latestSubmission = _sentinel,
  }) {
    return SpecialistAssignedExerciseDetailState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      assignment: identical(assignment, _sentinel)
          ? this.assignment
          : assignment as PatientAssignedExerciseItem?,
      latestSubmission: identical(latestSubmission, _sentinel)
          ? this.latestSubmission
          : latestSubmission as PatientSubmissionItem?,
    );
  }
}

final specialistAssignedExerciseDetailProvider = StateNotifierProvider.family<
    SpecialistAssignedExerciseDetailNotifier,
    SpecialistAssignedExerciseDetailState,
    String>((ref, assignedExerciseId) {
  return SpecialistAssignedExerciseDetailNotifier(
    ref,
    assignedExerciseId,
  );
});

class SpecialistAssignedExerciseDetailNotifier
    extends StateNotifier<SpecialistAssignedExerciseDetailState> {
  SpecialistAssignedExerciseDetailNotifier(this._ref, this._assignedExerciseId)
      : super(const SpecialistAssignedExerciseDetailState());

  final Ref _ref;
  final String _assignedExerciseId;

  Future<void> initialize() async {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    final dio = _ref.read(dioProvider);

    try {
      final assignmentResponse =
          await dio.get('/assigned-exercises/$_assignedExerciseId');
      final assignmentMap =
          ApiResponseParser.extractMap(assignmentResponse.data);
      if (assignmentMap == null || assignmentMap.isEmpty) {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Assigned exercise not found.',
          assignment: null,
        );
        return;
      }

      final assignment = PatientAssignedExerciseItem.fromMap(assignmentMap);

      PatientSubmissionItem? latest;
      try {
        final submissionsResponse = await dio.get(
          '/assigned-exercises/$_assignedExerciseId/submissions',
        );
        final rows = ApiResponseParser.extractList(submissionsResponse.data)
            .whereType<Map>()
            .map(
              (item) => item.map(
                (key, value) => MapEntry(key.toString(), value),
              ),
            )
            .toList();
        if (rows.isNotEmpty) {
          latest = PatientSubmissionItem.fromMap(
            rows.first,
            mediaTypeLabel: 'Submission',
          );
        }
      } catch (_) {
        latest = null;
      }

      state = state.copyWith(
        isLoading: false,
        assignment: assignment,
        latestSubmission: latest,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load assigned exercise.',
      );
    }
  }

  Future<void> refresh() => initialize();
}

const _sentinel = Object();
