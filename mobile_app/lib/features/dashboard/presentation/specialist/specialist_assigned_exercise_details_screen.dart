import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../core/services/api_client.dart';
import '../../../../core/utils/api_response_parser.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../providers/specialist_features_provider.dart';
import '../../providers/specialist_patient_details_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import '../../widgets/exercise_instruction_media_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_localization_utils.dart';
import 'specialist_exercises_widgets.dart';
import 'specialist_patient_details_localization_utils.dart';

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

  Future<void> _confirmAndDeactivate(
    SpecialistAssignedExerciseDetailNotifier notifier,
    PatientAssignedExerciseItem assignment,
  ) async {
    final l10n = AppLocalizations.of(context)!;
    if (!assignment.isActive) {
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.specialistAssignedExerciseDeactivateTitle),
          content: Text(l10n.specialistAssignedExerciseDeactivateBody),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(l10n.commonCancel),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: DashboardColors.highPriority,
              ),
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(l10n.specialistAssignedExerciseDeactivateConfirm),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    final messenger = ScaffoldMessenger.of(context);
    final ok = await notifier.deactivate();
    if (!mounted) {
      return;
    }

    if (ok) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistAssignedExerciseDeactivateSuccess)),
      );
      return;
    }

    final error = ref
        .read(
          specialistAssignedExerciseDetailProvider(widget.assignedExerciseId),
        )
        .actionErrorMessage;
    messenger.showSnackBar(
      SnackBar(
        content: Text(
          mapSpecialistAssignedExerciseError(
            l10n,
            error ?? l10n.specialistAssignedExerciseDeactivateFailed,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
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
          message: mapSpecialistAssignedExerciseError(
            l10n,
            state.errorMessage!,
          ),
          onRetry: notifier.refresh,
        ),
      );
    } else if (state.assignment == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardEmptyCard(
          message: l10n.specialistAssignedExerciseNotFound,
        ),
      );
    } else {
      final assignment = state.assignment!;
      final category = assignment.category?.trim();
      final description = assignment.description?.trim();
      final instructions = assignment.instructions?.trim();
      final dateFmt = DateFormat('MMM d, yyyy');

      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.brandCyan,
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
                        DashboardPriorityBadge(
                          label: localizedExerciseStatusLabel(
                            l10n,
                            assignment.statusLabel,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            _SectionCard(
              title: l10n.specialistExerciseDescriptionSection,
              body: (description != null && description.isNotEmpty)
                  ? description
                  : l10n.specialistExerciseNoDescription,
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            _SectionCard(
              title: l10n.specialistExerciseInstructionsSection,
              body: (instructions != null && instructions.isNotEmpty)
                  ? instructions
                  : l10n.specialistExerciseNoInstructions,
            ),
            if (assignment.hasInstructionMedia) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              ExerciseInstructionMediaCard(
                mediaUrl: assignment.instructionMediaUrl!,
                title: l10n.specialistAssignedExerciseInstructionalMedia,
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.65),
            DashboardSurfaceCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.specialistAssignedExerciseAssignmentSection,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.45),
                  _MetaRow(
                    label: l10n.adminFieldStatus,
                    value: localizedExerciseStatusLabel(
                      l10n,
                      assignment.statusLabel,
                    ),
                  ),
                  _MetaRow(
                    label: l10n.specialistAssignedExerciseFrequency,
                    value: assignment.frequency?.trim().isNotEmpty == true
                        ? localizedExerciseAssignmentFrequencyValue(
                            l10n,
                            assignment.frequency,
                          )
                        : '—',
                  ),
                  _MetaRow(
                    label: l10n.specialistAssignedExerciseAssigned,
                    value: assignment.createdAt != null
                        ? dateFmt.format(assignment.createdAt!)
                        : assignment.startDate != null
                        ? dateFmt.format(assignment.startDate!)
                        : '—',
                  ),
                  _MetaRow(
                    label: l10n.specialistAssignedExerciseDueDate,
                    value: assignment.dueDate != null
                        ? dateFmt.format(assignment.dueDate!)
                        : l10n.specialistPatientDetailsNoDueDate,
                  ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Text(
              l10n.specialistAssignedExerciseLatestSubmission,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.45),
            if (state.latestSubmission == null)
              DashboardEmptyCard(
                message: l10n.specialistAssignedExerciseNoSubmissions,
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
                      color: DashboardColors.brandCyan,
                    ),
                    SizedBox(width: context.dashSpacing * 0.65),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            localizedReviewStatus(
                              l10n,
                              state.latestSubmission!.reviewStatus,
                            ),
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            state.latestSubmission!.submittedAt != null
                                ? DateFormat(
                                    'MMM d, yyyy • h:mm a',
                                  ).format(state.latestSubmission!.submittedAt!)
                                : l10n.specialistAssignedExerciseRecentlySubmitted,
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
                onPressed: state.isDeactivating
                    ? null
                    : () => context.push(
                        AppRoutes.specialistExerciseDetails(
                          assignment.exerciseId!,
                        ),
                      ),
                icon: const Icon(Icons.menu_book_outlined),
                label: Text(l10n.specialistAssignedExerciseOpenLibraryExercise),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.brandCyan,
                  side: const BorderSide(color: DashboardColors.brandCyan),
                ),
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.65),
            if (assignment.isActive)
              OutlinedButton.icon(
                onPressed: state.isDeactivating
                    ? null
                    : () => _confirmAndDeactivate(notifier, assignment),
                icon: state.isDeactivating
                    ? SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: DashboardColors.highPriority,
                        ),
                      )
                    : const Icon(Icons.pause_circle_outline),
                label: Text(
                  state.isDeactivating
                      ? l10n.specialistAssignedExerciseDeactivating
                      : l10n.specialistAssignedExerciseDeactivateAssignment,
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.highPriority,
                  side: const BorderSide(color: DashboardColors.highPriority),
                ),
              )
            else
              Text(
                l10n.specialistAssignedExerciseAlreadyInactive,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.specialistAssignedExerciseTitle,
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
    this.isDeactivating = false,
    this.errorMessage,
    this.actionErrorMessage,
    this.assignment,
    this.latestSubmission,
  });

  final bool isLoading;
  final bool isDeactivating;
  final String? errorMessage;
  final String? actionErrorMessage;
  final PatientAssignedExerciseItem? assignment;
  final PatientSubmissionItem? latestSubmission;

  SpecialistAssignedExerciseDetailState copyWith({
    bool? isLoading,
    bool? isDeactivating,
    Object? errorMessage = _sentinel,
    Object? actionErrorMessage = _sentinel,
    Object? assignment = _sentinel,
    Object? latestSubmission = _sentinel,
  }) {
    return SpecialistAssignedExerciseDetailState(
      isLoading: isLoading ?? this.isLoading,
      isDeactivating: isDeactivating ?? this.isDeactivating,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      actionErrorMessage: identical(actionErrorMessage, _sentinel)
          ? this.actionErrorMessage
          : actionErrorMessage as String?,
      assignment: identical(assignment, _sentinel)
          ? this.assignment
          : assignment as PatientAssignedExerciseItem?,
      latestSubmission: identical(latestSubmission, _sentinel)
          ? this.latestSubmission
          : latestSubmission as PatientSubmissionItem?,
    );
  }
}

final specialistAssignedExerciseDetailProvider =
    StateNotifierProvider.family<
      SpecialistAssignedExerciseDetailNotifier,
      SpecialistAssignedExerciseDetailState,
      String
    >((ref, assignedExerciseId) {
      return SpecialistAssignedExerciseDetailNotifier(ref, assignedExerciseId);
    });

class SpecialistAssignedExerciseDetailNotifier
    extends StateNotifier<SpecialistAssignedExerciseDetailState> {
  SpecialistAssignedExerciseDetailNotifier(this._ref, this._assignedExerciseId)
    : super(const SpecialistAssignedExerciseDetailState());

  final Ref _ref;
  final String _assignedExerciseId;

  Future<void> initialize({bool showLoading = true}) async {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }

    state = state.copyWith(
      isLoading: showLoading,
      errorMessage: null,
      actionErrorMessage: null,
    );
    final dio = _ref.read(dioProvider);

    try {
      final assignmentResponse = await dio.get(
        '/assigned-exercises/$_assignedExerciseId',
      );
      final assignmentMap = ApiResponseParser.extractMap(
        assignmentResponse.data,
      );
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
              (item) =>
                  item.map((key, value) => MapEntry(key.toString(), value)),
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

  Future<bool> deactivate() async {
    final current = state.assignment;
    if (current == null || state.isDeactivating) {
      return false;
    }
    if (!current.isActive) {
      return true;
    }

    state = state.copyWith(isDeactivating: true, actionErrorMessage: null);

    try {
      await _ref
          .read(specialistFeaturesRepositoryProvider)
          .deactivateAssignedExercise(_assignedExerciseId);

      if (!mounted) {
        return true;
      }

      await initialize(showLoading: false);

      final patientId = (state.assignment?.patientId ?? current.patientId)
          ?.trim();
      if (patientId != null && patientId.isNotEmpty) {
        await _ref
            .read(specialistPatientDetailsProvider(patientId).notifier)
            .refresh();
      }

      if (!mounted) {
        return true;
      }

      state = state.copyWith(isDeactivating: false);
      return true;
    } catch (error) {
      if (!mounted) {
        return false;
      }
      final message = error.toString().replaceFirst('Exception: ', '');
      state = state.copyWith(
        isDeactivating: false,
        actionErrorMessage: message.isNotEmpty
            ? message
            : 'Failed to deactivate assigned exercise.',
      );
      return false;
    }
  }
}

const _sentinel = Object();
