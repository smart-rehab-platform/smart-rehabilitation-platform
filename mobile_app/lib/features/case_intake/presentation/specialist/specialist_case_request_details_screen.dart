import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../../dashboard/models/communication_models.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/specialist_page_scaffold.dart';
import '../../models/case_intake_request_model.dart';
import '../../models/case_request_attachment_model.dart';
import '../../models/specialist_case_request_detail_model.dart';
import '../../providers/specialist_case_request_detail_provider.dart';
import '../specialist_case_intake_localization_utils.dart';
import '../../widgets/case_request_status_chip.dart';

class SpecialistCaseRequestDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistCaseRequestDetailsScreen({
    super.key,
    required this.requestId,
  });

  final String requestId;

  @override
  ConsumerState<SpecialistCaseRequestDetailsScreen> createState() =>
      _SpecialistCaseRequestDetailsScreenState();
}

class _SpecialistCaseRequestDetailsScreenState
    extends ConsumerState<SpecialistCaseRequestDetailsScreen> {
  static const int _assessmentNotesMaxLength = 10000;

  final _notesFormKey = GlobalKey<FormState>();
  final _notesController = TextEditingController();
  String _notesBaseline = '';
  bool _notesDirty = false;
  bool _notesEditorSeeded = false;

  @override
  void initState() {
    super.initState();
    _notesController.addListener(_onNotesChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _notesController.removeListener(_onNotesChanged);
    _notesController.dispose();
    super.dispose();
  }

  void _onNotesChanged() {
    final dirty = _notesController.text != _notesBaseline;
    if (dirty != _notesDirty && mounted) {
      setState(() => _notesDirty = dirty);
    }
  }

  void _seedNotesEditor(String? notes) {
    final value = notes ?? '';
    _notesBaseline = value;
    if (_notesController.text != value) {
      _notesController.value = TextEditingValue(
        text: value,
        selection: TextSelection.collapsed(offset: value.length),
      );
    }
    _notesDirty = false;
    _notesEditorSeeded = true;
  }

  Future<void> _refresh() async {
    await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .refresh();
    if (!mounted) {
      return;
    }
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    final error = state.errorMessage;
    if (error != null && error.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistCaseRequestDetailError(
              AppLocalizations.of(context)!,
              error,
            ),
          ),
        ),
      );
    }
    if (!_notesDirty &&
        state.detail?.request.status == CaseIntakeStatus.underAssessment) {
      _seedNotesEditor(state.detail?.assessmentNotes);
    }
  }

  Future<void> _openAttachment(CaseRequestAttachment attachment) async {
    final l10n = AppLocalizations.of(context)!;
    final url = ApiConstants.resolveMediaUrl(attachment.fileUrl);
    if (url == null) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.attachmentUnableToOpen)));
      return;
    }
    final uri = Uri.tryParse(url);
    if (uri == null) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.attachmentUnableToOpen)));
      return;
    }

    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(l10n.attachmentUnableToOpen)));
      }
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.attachmentUnableToOpen)));
    }
  }

  Future<void> _copyText(String label, String? value) async {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return;
    }
    await Clipboard.setData(ClipboardData(text: trimmed));
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(AppLocalizations.of(context)!.commonLabelCopied(label)),
      ),
    );
  }

  void _openConversation(SpecialistCaseRequestDetail detail) {
    final request = detail.request;
    final conversationId = request.conversationId?.trim();
    if (conversationId == null || conversationId.isEmpty) {
      return;
    }

    final authUser = ref.read(authProvider).user;
    final specialistId =
        (request.assignedSpecialistId?.trim().isNotEmpty == true
            ? request.assignedSpecialistId!.trim()
            : authUser?.id?.trim()) ??
        '';
    final parentId = request.parentId.trim().isNotEmpty
        ? request.parentId.trim()
        : (detail.parent?.id.trim() ?? '');

    final conversation = CommunicationConversation(
      id: conversationId,
      patientId: request.patientId,
      parentId: parentId,
      specialistId: specialistId,
      parentName: detail.parent?.fullName,
      specialistName:
          authUser?.fullName ?? request.assignedSpecialist?.fullName,
      patientName: request.childName,
      caseRequestId: request.id,
      caseRequestChildName: request.childName,
    );

    context.push(AppRoutes.specialistChat(conversationId), extra: conversation);
  }

  Future<bool?> _showStartAssessmentConfirmDialog() {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.specialistCaseAssessmentStartTitle),
          content: Text(
            l10n.specialistCaseAssessmentStartMessage,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(l10n.commonCancel),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(l10n.specialistCaseAssessmentStartAction),
            ),
          ],
        );
      },
    );
  }

  Future<void> _onStartAssessmentPressed() async {
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    if (state.hasActiveMutation) {
      return;
    }

    final confirmed = await _showStartAssessmentConfirmDialog();
    if (confirmed != true || !mounted) {
      return;
    }

    final success = await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .startAssessment();
    if (!mounted) {
      return;
    }

    final actionState = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.specialistCaseAssessmentStartedSuccess,
          ),
        ),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistCaseRequestActionError(
              AppLocalizations.of(context)!,
              message,
            ),
          ),
        ),
      );
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  void _blockBackWhileMutating({
    required bool savingNotes,
    required bool accepting,
    required bool rejecting,
  }) {
    final l10n = AppLocalizations.of(context)!;
    final message = savingNotes
        ? l10n.specialistCaseAssessmentWaitSavingNotes
        : accepting
        ? l10n.specialistCaseAssessmentWaitCreatingProfile
        : rejecting
        ? l10n.specialistCaseAssessmentWaitRejecting
        : l10n.specialistCaseAssessmentWaitStarting;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _onSaveAssessmentNotes() async {
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    if (state.hasActiveMutation) {
      return;
    }
    if (!_notesDirty) {
      return;
    }
    final form = _notesFormKey.currentState;
    if (form == null || !form.validate()) {
      return;
    }

    final notes = _notesController.text.trim();
    final success = await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .saveAssessmentNotes(notes);
    if (!mounted) {
      return;
    }

    final actionState = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );

    if (success) {
      final savedNotes = actionState.detail?.assessmentNotes ?? notes;
      setState(() {
        _seedNotesEditor(savedNotes);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.specialistCaseAssessmentNotesUpdatedSuccess,
          ),
        ),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistCaseRequestActionError(
              AppLocalizations.of(context)!,
              message,
            ),
          ),
        ),
      );
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  Future<bool?> _showAcceptConfirmDialog() {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.specialistCaseAssessmentAcceptTitle),
          content: Text(
            l10n.specialistCaseAssessmentAcceptMessage,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(l10n.commonCancel),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(l10n.specialistCaseAssessmentAcceptAction),
            ),
          ],
        );
      },
    );
  }

  Future<void> _onAcceptCasePressed() async {
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    if (state.hasActiveMutation) {
      return;
    }

    final savedNotes = state.detail?.assessmentNotes?.trim() ?? '';
    if (savedNotes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.specialistCaseAssessmentAcceptNotesRequired,
          ),
        ),
      );
      return;
    }

    if (_notesDirty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.specialistCaseAssessmentAcceptSaveNotesFirst,
          ),
        ),
      );
      return;
    }

    final confirmed = await _showAcceptConfirmDialog();
    if (confirmed != true || !mounted) {
      return;
    }

    final patientId = await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .acceptCaseRequest();
    if (!mounted) {
      return;
    }

    final actionState = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );

    if (patientId != null && patientId.trim().isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.specialistCaseAssessmentPatientProfileCreatedSuccess,
          ),
        ),
      );
      context.push(AppRoutes.specialistPatientDetails(patientId));
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistCaseRequestActionError(
              AppLocalizations.of(context)!,
              message,
            ),
          ),
        ),
      );
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  Future<void> _onRejectCasePressed() async {
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    if (state.hasActiveMutation) {
      return;
    }

    final reason = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => const _RejectCaseBottomSheet(),
    );
    if (reason == null || reason.isEmpty || !mounted) {
      return;
    }

    final success = await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .rejectCaseRequest(reason);
    if (!mounted) {
      return;
    }

    final actionState = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.specialistCaseAssessmentRejectedSuccess,
          ),
        ),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistCaseRequestActionError(
              AppLocalizations.of(context)!,
              message,
            ),
          ),
        ),
      );
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    final detail = state.detail;
    final isInitialLoading = state.isLoading && detail == null;
    final starting = state.isStartingAssessment;
    final savingNotes = state.isSavingAssessmentNotes;
    final accepting = state.isAccepting;
    final rejecting = state.isRejecting;
    final mutationInProgress = state.hasActiveMutation;
    final theme = Theme.of(context);
    final hasConversation =
        detail?.request.conversationId != null &&
        detail!.request.conversationId!.trim().isNotEmpty;
    final showStartAssessment =
        detail?.request.status == CaseIntakeStatus.assigned;
    final isUnderAssessment =
        detail?.request.status == CaseIntakeStatus.underAssessment;
    final showReadOnlyNotes =
        !isUnderAssessment &&
        detail?.request.status != CaseIntakeStatus.assigned &&
        detail?.assessmentNotes != null &&
        detail!.assessmentNotes!.trim().isNotEmpty;

    if (isUnderAssessment && detail != null && !_notesEditorSeeded) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _notesEditorSeeded) {
          return;
        }
        final current = ref
            .read(specialistCaseRequestDetailProvider(widget.requestId))
            .detail;
        if (current?.request.status == CaseIntakeStatus.underAssessment) {
          setState(() => _seedNotesEditor(current?.assessmentNotes));
        }
      });
    }

    ref.listen<SpecialistCaseRequestDetailState>(
      specialistCaseRequestDetailProvider(widget.requestId),
      (previous, next) {
        final nextDetail = next.detail;
        if (nextDetail == null ||
            nextDetail.request.status != CaseIntakeStatus.underAssessment) {
          if (nextDetail?.request.status != CaseIntakeStatus.underAssessment) {
            _notesEditorSeeded = false;
          }
          return;
        }
        if (next.isSavingAssessmentNotes) {
          return;
        }
        final becameEditable =
            previous?.detail?.request.status !=
                CaseIntakeStatus.underAssessment &&
            nextDetail.request.status == CaseIntakeStatus.underAssessment;
        if (!_notesEditorSeeded || becameEditable) {
          _seedNotesEditor(nextDetail.assessmentNotes);
        }
      },
    );

    return PopScope(
      canPop: !mutationInProgress,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop || !mutationInProgress) {
          return;
        }
        _blockBackWhileMutating(
          savingNotes: savingNotes,
          accepting: accepting,
          rejecting: rejecting,
        );
      },
      child: SpecialistPageScaffold(
        title: l10n.specialistCaseRequestDetailsTitle,
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        onBackPressed: mutationInProgress
            ? () => _blockBackWhileMutating(
                savingNotes: savingNotes,
                accepting: accepting,
                rejecting: rejecting,
              )
            : null,
        body: isInitialLoading
            ? DashboardLoadingCard(
                message: l10n.specialistCaseRequestDetailsLoading,
              )
            : detail == null
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  DashboardErrorCard(
                    message: mapSpecialistCaseRequestDetailError(
                      l10n,
                      state.errorMessage ??
                          l10n.parentCaseRequestDetailsNotFound,
                    ),
                    onRetry: () => ref
                        .read(
                          specialistCaseRequestDetailProvider(
                            widget.requestId,
                          ).notifier,
                        )
                        .retry(),
                  ),
                  SizedBox(height: context.dashSpacing),
                  OutlinedButton(
                    onPressed: () => context.pop(),
                    child: Text(l10n.commonBack),
                  ),
                ],
              )
            : RefreshIndicator(
                onRefresh: mutationInProgress ? () async {} : _refresh,
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: context.dashPadding,
                  children: [
                    Text(
                      l10n.specialistCaseRequestDetailsReviewIntro,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                    if (state.isRefreshing)
                      const Padding(
                        padding: EdgeInsets.only(bottom: 12),
                        child: LinearProgressIndicator(),
                      ),
                    if (state.errorMessage != null &&
                        state.errorMessage!.isNotEmpty &&
                        !state.isRefreshing) ...[
                      DashboardErrorCard(
                        message: mapSpecialistCaseRequestDetailError(
                          l10n,
                          state.errorMessage!,
                        ),
                        onRetry: () => ref
                            .read(
                              specialistCaseRequestDetailProvider(
                                widget.requestId,
                              ).notifier,
                            )
                            .retry(),
                      ),
                      SizedBox(height: context.dashSpacing * 0.75),
                    ],
                    _HeaderCard(detail: detail),
                    SizedBox(height: context.dashSpacing),
                    _TimelineCard(request: detail.request),
                    if (detail.request.status == CaseIntakeStatus.rejected) ...[
                      SizedBox(height: context.dashSpacing),
                      _RejectionCard(reason: detail.request.rejectionReason),
                    ],
                    if (detail.request.status ==
                            CaseIntakeStatus.convertedToPatient &&
                        detail.request.patientId != null &&
                        detail.request.patientId!.trim().isNotEmpty) ...[
                      SizedBox(height: context.dashSpacing),
                      _ConversionCard(patientId: detail.request.patientId!),
                    ],
                    SizedBox(height: context.dashSpacing),
                    _ChildInformationCard(request: detail.request),
                    SizedBox(height: context.dashSpacing),
                    _CaseInformationCard(request: detail.request),
                    SizedBox(height: context.dashSpacing),
                    _DiagnosisTreatmentCard(request: detail.request),
                    SizedBox(height: context.dashSpacing),
                    _ParentInformationCard(
                      detail: detail,
                      onCopyEmail: () =>
                          _copyText(l10n.fieldEmail, detail.parent?.email),
                      onCopyPhone: () =>
                          _copyText(l10n.fieldPhone, detail.parent?.phone),
                    ),
                    SizedBox(height: context.dashSpacing),
                    _AttachmentsCard(
                      attachments: detail.request.attachments,
                      onOpen: _openAttachment,
                    ),
                    if (isUnderAssessment) ...[
                      SizedBox(height: context.dashSpacing),
                      _EditableAssessmentNotesCard(
                        formKey: _notesFormKey,
                        controller: _notesController,
                        maxLength: _assessmentNotesMaxLength,
                        isSaving: savingNotes || accepting || rejecting,
                        canSave: _notesDirty && !mutationInProgress,
                        onSave: _onSaveAssessmentNotes,
                      ),
                    ] else if (showReadOnlyNotes) ...[
                      SizedBox(height: context.dashSpacing),
                      _AssessmentNotesCard(notes: detail.assessmentNotes!),
                    ],
                    if (hasConversation) ...[
                      SizedBox(height: context.dashSpacing),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton.icon(
                          onPressed: () => _openConversation(detail),
                          icon: const Icon(Icons.forum_outlined),
                          label: Text(l10n.parentDashboardCaseOpenConversation),
                        ),
                      ),
                    ],
                    if (isUnderAssessment) ...[
                      SizedBox(height: context.dashSpacing * 0.75),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: mutationInProgress
                              ? null
                              : _onAcceptCasePressed,
                          child: accepting
                              ? _InlineActionProgress(
                                  label: l10n
                                      .specialistCaseAssessmentCreatingPatientProfile,
                                  color: theme.colorScheme.onPrimary,
                                )
                              : Text(l10n.specialistCaseAssessmentAcceptAction),
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.55),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: mutationInProgress
                              ? null
                              : _onRejectCasePressed,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: DashboardColors.highPriority,
                            side: const BorderSide(
                              color: DashboardColors.highPriority,
                            ),
                          ),
                          child: rejecting
                              ? _InlineActionProgress(
                                  label: l10n.specialistCaseAssessmentRejecting,
                                  color: DashboardColors.highPriority,
                                )
                              : Text(l10n.specialistCaseAssessmentRejectAction),
                        ),
                      ),
                    ],
                    if (showStartAssessment) ...[
                      SizedBox(height: context.dashSpacing * 0.75),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: mutationInProgress
                              ? null
                              : _onStartAssessmentPressed,
                          child: starting
                              ? _InlineActionProgress(
                                  label: l10n.specialistCaseAssessmentStarting,
                                  color: theme.colorScheme.primary,
                                )
                              : Text(l10n.specialistCaseAssessmentStartAction),
                        ),
                      ),
                    ],
                    SizedBox(height: context.dashSpacing * 1.5),
                  ],
                ),
              ),
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.detail});

  final SpecialistCaseRequestDetail detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final request = detail.request;
    final parentName = detail.parent?.fullName?.trim();
    final assignedSource = request.assignedAt ?? request.submittedAt;
    final assignedLabel = assignedSource != null
        ? DateFormat('MMM d, yyyy').format(assignedSource)
        : l10n.parentCaseRequestDetailsUnavailable;
    final dateLabel = request.assignedAt != null
        ? l10n.specialistCaseRequestsAssignedOn(assignedLabel)
        : l10n.parentDashboardCaseSubmittedOn(assignedLabel);
    final statusLabel = localizedCaseIntakeStatusLabel(l10n, request.status);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            request.childName.isNotEmpty
                ? request.childName
                : l10n.specialistCaseRequestsUnnamedChild,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          if (request.category?.name.trim().isNotEmpty == true) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              request.category!.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              CaseRequestStatusChip(status: request.status, label: statusLabel),
              Text(
                dateLabel,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
          ),
          if (parentName != null && parentName.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              l10n.specialistCaseRequestDetailsParentLabel(parentName),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

enum _TimelineVisual { completed, current, incomplete }

class _TimelineStepData {
  const _TimelineStepData({
    required this.label,
    required this.visual,
    this.subtitle,
  });

  final String label;
  final _TimelineVisual visual;
  final String? subtitle;
}

List<_TimelineStepData> _buildTimelineSteps(
  AppLocalizations l10n,
  CaseIntakeRequest request,
) {
  final assignedSubtitle = request.assignedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.assignedAt!)
      : null;
  final acceptedSubtitle = request.acceptedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.acceptedAt!)
      : null;
  final convertedSubtitle = request.convertedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.convertedAt!)
      : null;

  if (request.status == CaseIntakeStatus.rejected) {
    return [
      _TimelineStepData(
        label: specialistCaseTimelineStepLabel(l10n, 'assigned'),
        visual: _TimelineVisual.completed,
        subtitle: assignedSubtitle,
      ),
      _TimelineStepData(
        label: specialistCaseTimelineStepLabel(l10n, 'underAssessment'),
        visual: _TimelineVisual.incomplete,
      ),
      _TimelineStepData(
        label: specialistCaseTimelineStepLabel(l10n, 'accepted'),
        visual: _TimelineVisual.incomplete,
      ),
      _TimelineStepData(
        label: specialistCaseTimelineStepLabel(l10n, 'converted'),
        visual: _TimelineVisual.incomplete,
      ),
    ];
  }

  switch (request.status) {
    case CaseIntakeStatus.underAssessment:
      return [
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'assigned'),
          visual: _TimelineVisual.completed,
          subtitle: assignedSubtitle,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'underAssessment'),
          visual: _TimelineVisual.current,
          subtitle: l10n.specialistCaseRequestDetailsTimelineInProgress,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'accepted'),
          visual: _TimelineVisual.incomplete,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'converted'),
          visual: _TimelineVisual.incomplete,
        ),
      ];
    case CaseIntakeStatus.accepted:
      return [
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'assigned'),
          visual: _TimelineVisual.completed,
          subtitle: assignedSubtitle,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'underAssessment'),
          visual: _TimelineVisual.completed,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'accepted'),
          visual: _TimelineVisual.current,
          subtitle: acceptedSubtitle,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'converted'),
          visual: _TimelineVisual.incomplete,
        ),
      ];
    case CaseIntakeStatus.convertedToPatient:
      return [
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'assigned'),
          visual: _TimelineVisual.completed,
          subtitle: assignedSubtitle,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'underAssessment'),
          visual: _TimelineVisual.completed,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'accepted'),
          visual: _TimelineVisual.completed,
          subtitle: acceptedSubtitle,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'converted'),
          visual: _TimelineVisual.completed,
          subtitle: convertedSubtitle,
        ),
      ];
    case CaseIntakeStatus.assigned:
    case CaseIntakeStatus.pending:
    case CaseIntakeStatus.rejected:
    case null:
      return [
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'assigned'),
          visual: _TimelineVisual.current,
          subtitle: assignedSubtitle,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'underAssessment'),
          visual: _TimelineVisual.incomplete,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'accepted'),
          visual: _TimelineVisual.incomplete,
        ),
        _TimelineStepData(
          label: specialistCaseTimelineStepLabel(l10n, 'converted'),
          visual: _TimelineVisual.incomplete,
        ),
      ];
  }
}

class _TimelineCard extends StatelessWidget {
  const _TimelineCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final steps = _buildTimelineSteps(l10n, request);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseRequestDetailsStatusTimeline,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          ...steps.map((step) => _TimelineStepRow(step: step)),
        ],
      ),
    );
  }
}

class _TimelineStepRow extends StatelessWidget {
  const _TimelineStepRow({required this.step});

  final _TimelineStepData step;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (icon, color) = switch (step.visual) {
      _TimelineVisual.completed => (
        Icons.check_circle_rounded,
        DashboardColors.success,
      ),
      _TimelineVisual.current => (
        Icons.radio_button_checked_rounded,
        DashboardColors.brandCyan,
      ),
      _TimelineVisual.incomplete => (
        Icons.radio_button_unchecked_rounded,
        DashboardColors.textMuted,
      ),
    };
    final isActive =
        step.visual == _TimelineVisual.completed ||
        step.visual == _TimelineVisual.current;

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          SizedBox(width: context.dashSpacing * 0.4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  step.label,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    color: isActive
                        ? DashboardColors.textPrimary
                        : DashboardColors.textMuted,
                  ),
                ),
                if (step.subtitle != null && step.subtitle!.isNotEmpty)
                  Text(
                    step.subtitle!,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: DashboardColors.textMuted,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RejectionCard extends StatelessWidget {
  const _RejectionCard({this.reason});

  final String? reason;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final text = reason?.trim().isNotEmpty == true
        ? reason!.trim()
        : l10n.parentDashboardCaseNoRejectionReason;

    return DashboardSurfaceCard(
      tint: DashboardColors.highPriority,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseRequestDetailsRejectionReason,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.highPriority,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            text,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ConversionCard extends StatelessWidget {
  const _ConversionCard({required this.patientId});

  final String patientId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      tint: DashboardColors.success,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseRequestDetailsPatientProfileCreated,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () =>
                  context.push(AppRoutes.specialistPatientDetails(patientId)),
              child: Text(l10n.specialistCaseRequestDetailsOpenPatientProfile),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChildInformationCard extends StatelessWidget {
  const _ChildInformationCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final notProvided = l10n.specialistSessionNotProvided;
    final dobLabel = request.dateOfBirth != null
        ? DateFormat('MMM d, yyyy').format(request.dateOfBirth!)
        : notProvided;
    final ageLabel = formatSpecialistCaseIntakeAge(l10n, request.dateOfBirth);
    final genderLabel = localizedCaseIntakeGenderFromApi(l10n, request.gender);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsChildInformation,
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(label: l10n.fieldDateOfBirth, value: dobLabel),
          _InfoRow(
            label: l10n.specialistCaseRequestDetailsAge,
            value: ageLabel,
          ),
          _InfoRow(label: l10n.fieldGender, value: genderLabel),
        ],
      ),
    );
  }
}

class _CaseInformationCard extends StatelessWidget {
  const _CaseInformationCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final notProvided = l10n.specialistSessionNotProvided;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseRequestDetailsCaseInformation,
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsCaseDescription,
            value: _nonEmpty(request.caseDescription) ?? notProvided,
            allowWrap: true,
          ),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsObservedDifficulties,
            value: _nonEmpty(request.observedDifficulties) ?? notProvided,
            allowWrap: true,
          ),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsPreferredContactPeriod,
            value: request.preferredContactPeriod != null
                ? localizedCaseIntakePreferredContactPeriod(
                    l10n,
                    request.preferredContactPeriod,
                  )
                : notProvided,
          ),
        ],
      ),
    );
  }
}

class _DiagnosisTreatmentCard extends StatelessWidget {
  const _DiagnosisTreatmentCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final diagnosisDetails = request.hasPreviousDiagnosis
        ? _nonEmpty(request.previousDiagnosisDetails)
        : null;
    final treatmentDetails = request.isCurrentlyReceivingTreatment
        ? _nonEmpty(request.currentTreatmentDetails)
        : null;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseRequestDetailsPreviousDiagnosisTreatment,
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsPreviousDiagnosis,
            value: localizedBooleanYesNo(l10n, request.hasPreviousDiagnosis),
          ),
          if (diagnosisDetails != null)
            _InfoRow(
              label: l10n.specialistCaseRequestDetailsDiagnosisDetails,
              value: diagnosisDetails,
              allowWrap: true,
            ),
          _InfoRow(
            label: l10n.specialistCaseRequestDetailsCurrentlyReceivingTreatment,
            value: localizedBooleanYesNo(
              l10n,
              request.isCurrentlyReceivingTreatment,
            ),
          ),
          if (treatmentDetails != null)
            _InfoRow(
              label: l10n.specialistCaseRequestDetailsTreatmentDetails,
              value: treatmentDetails,
              allowWrap: true,
            ),
        ],
      ),
    );
  }
}

class _ParentInformationCard extends StatelessWidget {
  const _ParentInformationCard({
    required this.detail,
    required this.onCopyEmail,
    required this.onCopyPhone,
  });

  final SpecialistCaseRequestDetail detail;
  final VoidCallback onCopyEmail;
  final VoidCallback onCopyPhone;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final parent = detail.parent;
    final notProvided = l10n.specialistSessionNotProvided;
    final name = parent?.fullName?.trim().isNotEmpty == true
        ? parent!.fullName!.trim()
        : notProvided;
    final email = parent?.email?.trim() ?? '';
    final phone = parent?.phone?.trim() ?? '';
    final imageUrl = ApiConstants.resolveProfileImageUrl(
      parent?.profileImageUrl,
    );

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseRequestDetailsParentInformation,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: DashboardColors.brandSoft,
                backgroundImage: imageUrl != null
                    ? CachedNetworkImageProvider(imageUrl)
                    : null,
                child: imageUrl == null
                    ? const Icon(
                        Icons.person_outline_rounded,
                        color: DashboardColors.brandCyan,
                      )
                    : null,
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.35),
                    _ContactRow(
                      label: l10n.fieldEmail,
                      value: email.isNotEmpty ? email : notProvided,
                      canCopy: email.isNotEmpty,
                      onCopy: onCopyEmail,
                    ),
                    SizedBox(height: context.dashSpacing * 0.25),
                    _ContactRow(
                      label: l10n.fieldPhone,
                      value: phone.isNotEmpty ? phone : notProvided,
                      canCopy: phone.isNotEmpty,
                      onCopy: onCopyPhone,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({
    required this.label,
    required this.value,
    required this.canCopy,
    required this.onCopy,
  });

  final String label;
  final String value;
  final bool canCopy;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                value,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        if (canCopy)
          IconButton(
            tooltip: AppLocalizations.of(
              context,
            )!.specialistCaseRequestDetailsCopyLabel(label),
            onPressed: onCopy,
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.copy_rounded, size: 18),
          ),
      ],
    );
  }
}

class _AttachmentsCard extends StatelessWidget {
  const _AttachmentsCard({required this.attachments, required this.onOpen});

  final List<CaseRequestAttachment> attachments;
  final ValueChanged<CaseRequestAttachment> onOpen;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsAttachments,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          if (attachments.isEmpty)
            Text(
              l10n.specialistCaseRequestDetailsNoAttachments,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            )
          else
            ...attachments.map(
              (attachment) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.4),
                child: Row(
                  children: [
                    Icon(
                      _attachmentIcon(attachment),
                      color: DashboardColors.brandCyan,
                      size: 20,
                    ),
                    SizedBox(width: context.dashSpacing * 0.35),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            attachment.displayName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            localizedCaseIntakeAttachmentTypeLabel(
                              l10n,
                              attachment,
                            ),
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: DashboardColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () => onOpen(attachment),
                      child: Text(l10n.commonOpen),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _InlineActionProgress extends StatelessWidget {
  const _InlineActionProgress({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(strokeWidth: 2, color: color),
        ),
        const SizedBox(width: 10),
        Text(
          label,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }
}

class _RejectCaseBottomSheet extends StatefulWidget {
  const _RejectCaseBottomSheet();

  @override
  State<_RejectCaseBottomSheet> createState() => _RejectCaseBottomSheetState();
}

class _RejectCaseBottomSheetState extends State<_RejectCaseBottomSheet> {
  static const int _reasonMaxLength = 2000;
  static const int _reasonMinLength = 5;

  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  bool _isValid = false;

  @override
  void initState() {
    super.initState();
    _reasonController.addListener(_onReasonChanged);
  }

  @override
  void dispose() {
    _reasonController.removeListener(_onReasonChanged);
    _reasonController.dispose();
    super.dispose();
  }

  void _onReasonChanged() {
    final trimmed = _reasonController.text.trim();
    final valid =
        trimmed.length >= _reasonMinLength &&
        trimmed.length <= _reasonMaxLength;
    if (valid != _isValid) {
      setState(() => _isValid = valid);
    }
  }

  String? _validateReason(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return 'Reason for rejection is required.';
    }
    if (trimmed.length < _reasonMinLength) {
      return 'Reason must be at least $_reasonMinLength characters.';
    }
    if (trimmed.length > _reasonMaxLength) {
      return 'Reason must not exceed $_reasonMaxLength characters.';
    }
    return null;
  }

  void _submit() {
    final form = _formKey.currentState;
    if (form == null || !form.validate()) {
      return;
    }
    final reason = _reasonController.text.trim();
    Navigator.of(context).pop(reason);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        decoration: const BoxDecoration(
          color: DashboardColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(
              context.dashPadding.left,
              context.dashSpacing * 0.55,
              context.dashPadding.right,
              context.dashSpacing * 1.1,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: DashboardColors.border,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.85),
                  Text(
                    l10n.specialistCaseAssessmentRejectTitle,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.85),
                  TextFormField(
                    controller: _reasonController,
                    minLines: 4,
                    maxLines: 8,
                    maxLength: _reasonMaxLength,
                    textInputAction: TextInputAction.newline,
                    keyboardType: TextInputType.multiline,
                    decoration: InputDecoration(
                      labelText: l10n.specialistCaseAssessmentRejectReasonLabel,
                      alignLabelWithHint: true,
                      helperText:
                          l10n.specialistCaseAssessmentRejectReasonHelper,
                      border: const OutlineInputBorder(),
                    ),
                    validator: (value) {
                      final result = _validateReason(value);
                      if (result == null) {
                        return null;
                      }
                      return mapSpecialistCaseRejectReasonValidation(
                        l10n,
                        result,
                        minLength: _reasonMinLength,
                        maxLength: _reasonMaxLength,
                      );
                    },
                  ),
                  SizedBox(height: context.dashSpacing),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(l10n.commonCancel),
                        ),
                      ),
                      SizedBox(width: context.dashSpacing * 0.55),
                      Expanded(
                        child: FilledButton(
                          onPressed: _isValid ? _submit : null,
                          style: FilledButton.styleFrom(
                            backgroundColor: DashboardColors.highPriority,
                            foregroundColor: Colors.white,
                          ),
                          child: Text(
                            l10n.specialistCaseAssessmentRejectAction,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AssessmentNotesCard extends StatelessWidget {
  const _AssessmentNotesCard({required this.notes});

  final String notes;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.specialistCaseAssessmentNotesTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            notes,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _EditableAssessmentNotesCard extends StatelessWidget {
  const _EditableAssessmentNotesCard({
    required this.formKey,
    required this.controller,
    required this.maxLength,
    required this.isSaving,
    required this.canSave,
    required this.onSave,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController controller;
  final int maxLength;
  final bool isSaving;
  final bool canSave;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.specialistCaseAssessmentNotesTitle,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            TextFormField(
              controller: controller,
              enabled: !isSaving,
              minLines: 6,
              maxLines: 8,
              maxLength: maxLength,
              textInputAction: TextInputAction.newline,
              keyboardType: TextInputType.multiline,
              decoration: InputDecoration(
                alignLabelWithHint: true,
                hintText: l10n.specialistCaseAssessmentNotesHint,
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                final trimmed = value?.trim() ?? '';
                String? result;
                if (trimmed.isEmpty) {
                  result = 'Assessment notes are required.';
                } else if (trimmed.length > maxLength) {
                  result =
                      'Assessment notes must not exceed $maxLength characters.';
                }
                if (result == null) {
                  return null;
                }
                return mapSpecialistCaseAssessmentNotesValidation(
                  l10n,
                  result,
                  maxLength: maxLength,
                );
              },
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: canSave ? onSave : null,
                child: isSaving
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: theme.colorScheme.onPrimary,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            l10n.commonSaving,
                            style: theme.textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onPrimary,
                            ),
                          ),
                        ],
                      )
                    : Text(l10n.specialistCaseAssessmentSaveNotes),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    this.allowWrap = false,
  });

  final String label;
  final String value;
  final bool allowWrap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.45),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            value,
            maxLines: allowWrap ? null : 3,
            overflow: allowWrap ? TextOverflow.visible : TextOverflow.ellipsis,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

String? _nonEmpty(String? value) {
  final trimmed = value?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return null;
  }
  return trimmed;
}

IconData _attachmentIcon(CaseRequestAttachment attachment) {
  if (attachment.isImage) {
    return Icons.image_outlined;
  }
  if (attachment.isAudio) {
    return Icons.audiotrack_outlined;
  }
  if (attachment.isVideo) {
    return Icons.videocam_outlined;
  }
  if (attachment.isPdf) {
    return Icons.picture_as_pdf_outlined;
  }
  return Icons.attach_file_rounded;
}
