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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
    }
    if (!_notesDirty &&
        state.detail?.request.status == CaseIntakeStatus.underAssessment) {
      _seedNotesEditor(state.detail?.assessmentNotes);
    }
  }

  Future<void> _openAttachment(CaseRequestAttachment attachment) async {
    final url = ApiConstants.resolveMediaUrl(attachment.fileUrl);
    if (url == null) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open this attachment.')),
      );
      return;
    }
    final uri = Uri.tryParse(url);
    if (uri == null) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open this attachment.')),
      );
      return;
    }

    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to open this attachment.')),
        );
      }
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open this attachment.')),
      );
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
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('$label copied')));
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
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Start Assessment'),
          content: Text(
            'Contact the parent first if you have not already. Start the preliminary assessment for this case?',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Start Assessment'),
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
        const SnackBar(content: Text('Assessment started successfully')),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  void _blockBackWhileMutating({
    required bool savingNotes,
    required bool accepting,
    required bool rejecting,
    required bool converting,
  }) {
    final message = savingNotes
        ? 'Please wait while assessment notes are being saved.'
        : accepting
        ? 'Please wait while the case is being accepted.'
        : rejecting
        ? 'Please wait while the case is being rejected.'
        : converting
        ? 'Please wait while the patient profile is being created.'
        : 'Please wait while the assessment is starting.';
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
        const SnackBar(content: Text('Assessment notes updated successfully')),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  Future<bool?> _showAcceptConfirmDialog() {
    final theme = Theme.of(context);
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Accept Case'),
          content: Text(
            'Accept this case for continued rehabilitation follow-up?\n\n'
            'The patient profile will not be created yet.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Accept Case'),
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
        const SnackBar(
          content: Text('Save assessment notes before accepting this case.'),
        ),
      );
      return;
    }

    if (_notesDirty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Save your assessment notes before accepting.'),
        ),
      );
      return;
    }

    final confirmed = await _showAcceptConfirmDialog();
    if (confirmed != true || !mounted) {
      return;
    }

    final success = await ref
        .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
        .acceptCaseRequest();
    if (!mounted) {
      return;
    }

    final actionState = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Case request accepted successfully')),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
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
        const SnackBar(content: Text('Case request rejected successfully')),
      );
      return;
    }

    final message = actionState.actionErrorMessage;
    if (message != null && message.isNotEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      ref
          .read(specialistCaseRequestDetailProvider(widget.requestId).notifier)
          .clearActionError();
    }
  }

  Future<void> _onCreatePatientProfilePressed() async {
    final state = ref.read(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    if (state.hasActiveMutation) {
      return;
    }
    if (state.detail?.request.status != CaseIntakeStatus.accepted) {
      return;
    }

    final converted = await context.push<bool>(
      AppRoutes.specialistConvertPatient(widget.requestId),
    );
    if (!mounted) {
      return;
    }
    if (converted == true) {
      final message =
          ref
              .read(specialistCaseRequestDetailProvider(widget.requestId))
              .lastConvertResult
              ?.message ??
          'Case request converted to patient successfully';
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(
      specialistCaseRequestDetailProvider(widget.requestId),
    );
    final detail = state.detail;
    final isInitialLoading = state.isLoading && detail == null;
    final starting = state.isStartingAssessment;
    final savingNotes = state.isSavingAssessmentNotes;
    final accepting = state.isAccepting;
    final rejecting = state.isRejecting;
    final converting = state.isConverting;
    final mutationInProgress = state.hasActiveMutation;
    final theme = Theme.of(context);
    final hasConversation =
        detail?.request.conversationId != null &&
        detail!.request.conversationId!.trim().isNotEmpty;
    final showStartAssessment =
        detail?.request.status == CaseIntakeStatus.assigned;
    final isUnderAssessment =
        detail?.request.status == CaseIntakeStatus.underAssessment;
    final isAccepted = detail?.request.status == CaseIntakeStatus.accepted;
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
          converting: converting,
        );
      },
      child: SpecialistPageScaffold(
        title: 'Case Request',
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        onBackPressed: mutationInProgress
            ? () => _blockBackWhileMutating(
                savingNotes: savingNotes,
                accepting: accepting,
                rejecting: rejecting,
                converting: converting,
              )
            : null,
        body: isInitialLoading
            ? const DashboardLoadingCard(message: 'Loading case request...')
            : detail == null
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  DashboardErrorCard(
                    message: state.errorMessage ?? 'Case request not found.',
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
                    child: const Text('Back'),
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
                      'Review the submitted information before starting the assessment.',
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
                        message: state.errorMessage!,
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
                          _copyText('Email', detail.parent?.email),
                      onCopyPhone: () =>
                          _copyText('Phone', detail.parent?.phone),
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
                          label: const Text('Open Conversation'),
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
                                  label: 'Accepting...',
                                  color: theme.colorScheme.onPrimary,
                                )
                              : const Text('Accept Case'),
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
                              ? const _InlineActionProgress(
                                  label: 'Rejecting...',
                                  color: DashboardColors.highPriority,
                                )
                              : const Text('Reject Case'),
                        ),
                      ),
                    ],
                    if (isAccepted) ...[
                      SizedBox(height: context.dashSpacing * 0.75),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: mutationInProgress
                              ? null
                              : _onCreatePatientProfilePressed,
                          child: const Text('Create Patient Profile'),
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
                                  label: 'Starting...',
                                  color: theme.colorScheme.primary,
                                )
                              : const Text('Start Assessment'),
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
    final request = detail.request;
    final parentName = detail.parent?.fullName?.trim();
    final assignedSource = request.assignedAt ?? request.submittedAt;
    final assignedLabel = assignedSource != null
        ? DateFormat('MMM d, yyyy').format(assignedSource)
        : 'Unavailable';
    final assignedPrefix = request.assignedAt != null
        ? 'Assigned'
        : 'Submitted';

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            request.childName.isNotEmpty ? request.childName : 'Unnamed child',
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
              CaseRequestStatusChip(status: request.status),
              Text(
                '$assignedPrefix $assignedLabel',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
          ),
          if (parentName != null && parentName.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              'Parent: $parentName',
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

List<_TimelineStepData> _buildTimelineSteps(CaseIntakeRequest request) {
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
        label: 'Assigned',
        visual: _TimelineVisual.completed,
        subtitle: assignedSubtitle,
      ),
      const _TimelineStepData(
        label: 'Under Assessment',
        visual: _TimelineVisual.incomplete,
      ),
      const _TimelineStepData(
        label: 'Accepted',
        visual: _TimelineVisual.incomplete,
      ),
      const _TimelineStepData(
        label: 'Converted',
        visual: _TimelineVisual.incomplete,
      ),
    ];
  }

  switch (request.status) {
    case CaseIntakeStatus.underAssessment:
      return [
        _TimelineStepData(
          label: 'Assigned',
          visual: _TimelineVisual.completed,
          subtitle: assignedSubtitle,
        ),
        const _TimelineStepData(
          label: 'Under Assessment',
          visual: _TimelineVisual.current,
          subtitle: 'In progress',
        ),
        const _TimelineStepData(
          label: 'Accepted',
          visual: _TimelineVisual.incomplete,
        ),
        const _TimelineStepData(
          label: 'Converted',
          visual: _TimelineVisual.incomplete,
        ),
      ];
    case CaseIntakeStatus.accepted:
      return [
        _TimelineStepData(
          label: 'Assigned',
          visual: _TimelineVisual.completed,
          subtitle: assignedSubtitle,
        ),
        const _TimelineStepData(
          label: 'Under Assessment',
          visual: _TimelineVisual.completed,
        ),
        _TimelineStepData(
          label: 'Accepted',
          visual: _TimelineVisual.current,
          subtitle: acceptedSubtitle,
        ),
        const _TimelineStepData(
          label: 'Converted',
          visual: _TimelineVisual.incomplete,
        ),
      ];
    case CaseIntakeStatus.convertedToPatient:
      return [
        _TimelineStepData(
          label: 'Assigned',
          visual: _TimelineVisual.completed,
          subtitle: assignedSubtitle,
        ),
        const _TimelineStepData(
          label: 'Under Assessment',
          visual: _TimelineVisual.completed,
        ),
        _TimelineStepData(
          label: 'Accepted',
          visual: _TimelineVisual.completed,
          subtitle: acceptedSubtitle,
        ),
        _TimelineStepData(
          label: 'Converted',
          visual: _TimelineVisual.completed,
          subtitle: convertedSubtitle,
        ),
      ];
    case CaseIntakeStatus.assigned:
    case CaseIntakeStatus.pending:
    case null:
      return [
        _TimelineStepData(
          label: 'Assigned',
          visual: _TimelineVisual.current,
          subtitle: assignedSubtitle,
        ),
        const _TimelineStepData(
          label: 'Under Assessment',
          visual: _TimelineVisual.incomplete,
        ),
        const _TimelineStepData(
          label: 'Accepted',
          visual: _TimelineVisual.incomplete,
        ),
        const _TimelineStepData(
          label: 'Converted',
          visual: _TimelineVisual.incomplete,
        ),
      ];
    case CaseIntakeStatus.rejected:
      return const [];
  }
}

class _TimelineCard extends StatelessWidget {
  const _TimelineCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final steps = _buildTimelineSteps(request);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Status Timeline',
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
        DashboardColors.primary,
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
    final text = reason?.trim().isNotEmpty == true
        ? reason!.trim()
        : 'No rejection reason was provided.';

    return DashboardSurfaceCard(
      tint: DashboardColors.highPriority,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Rejection Reason',
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

    return DashboardSurfaceCard(
      tint: DashboardColors.success,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Patient profile created successfully.',
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
              child: const Text('Open Patient Profile'),
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
    final dobLabel = request.dateOfBirth != null
        ? DateFormat('MMM d, yyyy').format(request.dateOfBirth!)
        : 'Not provided';
    final ageLabel = _formatAge(request.dateOfBirth) ?? 'Unavailable';
    final genderLabel =
        CaseIntakeGender.fromApi(request.gender)?.label ??
        (request.gender?.trim().isNotEmpty == true
            ? request.gender!
            : 'Not provided');

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Child Information',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(label: 'Date of birth', value: dobLabel),
          _InfoRow(label: 'Age', value: ageLabel),
          _InfoRow(label: 'Gender', value: genderLabel),
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
    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Case Information',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(
            label: 'Case description',
            value: _nonEmpty(request.caseDescription) ?? 'Not provided',
            allowWrap: true,
          ),
          _InfoRow(
            label: 'Observed difficulties',
            value: _nonEmpty(request.observedDifficulties) ?? 'Not provided',
            allowWrap: true,
          ),
          _InfoRow(
            label: 'Preferred contact period',
            value: request.preferredContactPeriod?.label ?? 'Not provided',
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
            'Previous Diagnosis & Treatment',
            style: Theme.of(
              context,
            ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(
            label: 'Previous diagnosis',
            value: request.hasPreviousDiagnosis ? 'Yes' : 'No',
          ),
          if (diagnosisDetails != null)
            _InfoRow(
              label: 'Diagnosis details',
              value: diagnosisDetails,
              allowWrap: true,
            ),
          _InfoRow(
            label: 'Currently receiving treatment',
            value: request.isCurrentlyReceivingTreatment ? 'Yes' : 'No',
          ),
          if (treatmentDetails != null)
            _InfoRow(
              label: 'Treatment details',
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
    final parent = detail.parent;
    final name = parent?.fullName?.trim().isNotEmpty == true
        ? parent!.fullName!.trim()
        : 'Not provided';
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
            'Parent Information',
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
                backgroundColor: DashboardColors.purpleSoft,
                backgroundImage: imageUrl != null
                    ? CachedNetworkImageProvider(imageUrl)
                    : null,
                child: imageUrl == null
                    ? const Icon(
                        Icons.person_outline_rounded,
                        color: DashboardColors.primary,
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
                      label: 'Email',
                      value: email.isNotEmpty ? email : 'Not provided',
                      canCopy: email.isNotEmpty,
                      onCopy: onCopyEmail,
                    ),
                    SizedBox(height: context.dashSpacing * 0.25),
                    _ContactRow(
                      label: 'Phone',
                      value: phone.isNotEmpty ? phone : 'Not provided',
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
            tooltip: 'Copy $label',
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

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Attachments',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          if (attachments.isEmpty)
            Text(
              'No attachments',
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
                      color: DashboardColors.primary,
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
                            _attachmentTypeLabel(attachment),
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: DashboardColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: () => onOpen(attachment),
                      child: const Text('Open'),
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
                    'Reject Case',
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
                    decoration: const InputDecoration(
                      labelText: 'Reason for rejection',
                      alignLabelWithHint: true,
                      helperText: 'This reason will be visible to the parent.',
                      border: OutlineInputBorder(),
                    ),
                    validator: _validateReason,
                  ),
                  SizedBox(height: context.dashSpacing),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Cancel'),
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
                          child: const Text('Reject Case'),
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

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Preliminary Assessment Notes',
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

    return DashboardSurfaceCard(
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Preliminary Assessment Notes',
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
              decoration: const InputDecoration(
                alignLabelWithHint: true,
                hintText: 'Enter preliminary assessment notes',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                final trimmed = value?.trim() ?? '';
                if (trimmed.isEmpty) {
                  return 'Assessment notes are required.';
                }
                if (trimmed.length > maxLength) {
                  return 'Assessment notes must not exceed $maxLength characters.';
                }
                return null;
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
                            'Saving...',
                            style: theme.textTheme.labelLarge?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onPrimary,
                            ),
                          ),
                        ],
                      )
                    : const Text('Save Notes'),
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

String? _formatAge(DateTime? dateOfBirth) {
  if (dateOfBirth == null) {
    return null;
  }
  final now = DateTime.now();
  final dob = DateTime(dateOfBirth.year, dateOfBirth.month, dateOfBirth.day);
  final today = DateTime(now.year, now.month, now.day);
  if (dob.isAfter(today)) {
    return null;
  }

  var years = today.year - dob.year;
  var months = today.month - dob.month;
  var days = today.day - dob.day;
  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) {
    return null;
  }
  if (years == 0) {
    if (months <= 0) {
      return 'Under 1 month';
    }
    return months == 1 ? '1 month' : '$months months';
  }
  return years == 1 ? '1 year' : '$years years';
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

String _attachmentTypeLabel(CaseRequestAttachment attachment) {
  if (attachment.isImage) {
    return 'Image';
  }
  if (attachment.isAudio) {
    return 'Audio';
  }
  if (attachment.isVideo) {
    return 'Video';
  }
  if (attachment.isPdf) {
    return 'PDF';
  }
  final type = attachment.fileType?.trim();
  if (type != null && type.isNotEmpty) {
    return type;
  }
  return 'File';
}
