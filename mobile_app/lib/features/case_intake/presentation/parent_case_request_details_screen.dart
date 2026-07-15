import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../dashboard/models/communication_models.dart';
import '../../dashboard/presentation/communication/communication_attachment_picker.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../dashboard/widgets/parent_page_scaffold.dart';
import '../models/case_intake_request_model.dart';
import '../models/case_request_attachment_model.dart';
import '../providers/parent_case_intake_provider.dart';
import '../widgets/case_request_status_chip.dart';

const _progressStepLabels = <String>[
  'Submitted',
  'Admin Review',
  'Specialist Assigned',
  'Assessment',
  'Accepted',
  'Patient Profile Created',
];

class ParentCaseRequestDetailsScreen extends ConsumerStatefulWidget {
  const ParentCaseRequestDetailsScreen({super.key, required this.requestId});

  final String requestId;

  @override
  ConsumerState<ParentCaseRequestDetailsScreen> createState() =>
      _ParentCaseRequestDetailsScreenState();
}

class _ParentCaseRequestDetailsScreenState
    extends ConsumerState<ParentCaseRequestDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(parentCaseIntakeProvider.notifier)
          .loadRequestDetails(widget.requestId);
    });
  }

  Future<void> _refresh() async {
    await ref
        .read(parentCaseIntakeProvider.notifier)
        .refreshRequestDetails(widget.requestId);
  }

  Future<void> _pickAndUploadAttachment(CaseIntakeRequest request) async {
    await showCommunicationAttachmentSheet(
      context: context,
      onSelected: (selection) async {
        final attachment = await ref
            .read(parentCaseIntakeProvider.notifier)
            .uploadAndAttachFile(
              requestId: request.id,
              bytes: selection.bytes,
              filename: selection.filename,
              mimeType: selection.mimeType,
            );

        if (!mounted) {
          return;
        }

        if (attachment != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Attachment uploaded successfully')),
          );
        } else {
          final error = ref.read(parentCaseIntakeProvider).errorMessage;
          if (error != null && error.isNotEmpty) {
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text(error)));
          }
        }
      },
    );
  }

  Future<void> _deleteAttachment(
    CaseIntakeRequest request,
    CaseRequestAttachment attachment,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete attachment?'),
        content: Text('Remove "${attachment.displayName}" from this request?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) {
      return;
    }

    final success = await ref
        .read(parentCaseIntakeProvider.notifier)
        .deleteAttachment(requestId: request.id, attachmentId: attachment.id);

    if (!mounted) {
      return;
    }

    if (success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Attachment deleted')));
    }
  }

  Future<void> _openAttachment(CaseRequestAttachment attachment) async {
    final url = ApiConstants.resolveMediaUrl(attachment.fileUrl);
    if (url == null) {
      return;
    }
    final uri = Uri.tryParse(url);
    if (uri == null) {
      return;
    }
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  void _openConversation(CaseIntakeRequest request) {
    final conversationId = request.conversationId;
    if (conversationId == null || conversationId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Conversation is not available yet.')),
      );
      return;
    }

    final conversation = CommunicationConversation(
      id: conversationId,
      patientId: request.patientId,
      parentId: request.parentId,
      specialistId: request.assignedSpecialistId ?? '',
      specialistName: request.assignedSpecialist?.fullName,
      patientName: request.childName,
      caseRequestId: request.id,
      caseRequestChildName: request.childName,
    );

    context.push(AppRoutes.parentChat(conversationId), extra: conversation);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentCaseIntakeProvider);
    final request = state.selectedRequest;
    final isInitialLoading =
        state.isLoading && (request == null || request.id != widget.requestId);

    return ParentPageScaffold(
      title: 'Request Details',
      showBackButton: true,
      actions: request != null && request.canEdit
          ? [
              IconButton(
                tooltip: 'Edit request',
                icon: const Icon(Icons.edit_outlined),
                onPressed: () =>
                    context.push(AppRoutes.parentCaseRequestEdit(request.id)),
              ),
            ]
          : null,
      body: isInitialLoading
          ? const Center(child: DashboardLoadingCard())
          : request == null || request.id != widget.requestId
          ? DashboardErrorCard(
              message: state.errorMessage ?? 'Case request not found.',
              onRetry: () => ref
                  .read(parentCaseIntakeProvider.notifier)
                  .loadRequestDetails(widget.requestId),
            )
          : RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  if (state.errorMessage != null) ...[
                    DashboardErrorCard(
                      message: state.errorMessage!,
                      onRetry: () => ref
                          .read(parentCaseIntakeProvider.notifier)
                          .clearError(),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  if (state.isRefreshing)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: LinearProgressIndicator(),
                    ),
                  _HeaderSection(request: request),
                  SizedBox(height: context.dashSpacing),
                  _ProgressSection(request: request),
                  if (request.status == CaseIntakeStatus.rejected) ...[
                    SizedBox(height: context.dashSpacing),
                    _RejectionCard(request: request),
                  ],
                  if (request.status == CaseIntakeStatus.convertedToPatient &&
                      request.patientId != null &&
                      request.patientId!.isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing),
                    _ConvertedCard(patientId: request.patientId!),
                  ],
                  SizedBox(height: context.dashSpacing),
                  _ChildInfoSection(request: request),
                  if (request.assignedSpecialist != null &&
                      (request.assignedSpecialist!.id.isNotEmpty ||
                          (request.assignedSpecialist!.fullName?.isNotEmpty ??
                              false))) ...[
                    SizedBox(height: context.dashSpacing),
                    _SpecialistSection(
                      request: request,
                      onOpenConversation: request.showsConversationAction
                          ? () => _openConversation(request)
                          : null,
                    ),
                  ],
                  SizedBox(height: context.dashSpacing),
                  _AttachmentsSection(
                    request: request,
                    isUploading: state.isUploadingAttachment,
                    onAdd: () => _pickAndUploadAttachment(request),
                    onOpen: _openAttachment,
                    onDelete: (attachment) =>
                        _deleteAttachment(request, attachment),
                  ),
                ],
              ),
            ),
    );
  }
}

class _HeaderSection extends StatelessWidget {
  const _HeaderSection({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final submittedLabel = request.submittedAt != null
        ? DateFormat('MMM d, yyyy').format(request.submittedAt!)
        : 'Unavailable';

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            request.childName,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          if (request.category?.name != null)
            Text(
              request.category!.name,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.5),
          Row(
            children: [
              CaseRequestStatusChip(status: request.status),
              const Spacer(),
              Text(
                'Submitted $submittedLabel',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProgressSection extends StatelessWidget {
  const _ProgressSection({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isRejected = request.status == CaseIntakeStatus.rejected;
    final activeIndex =
        request.status?.progressStepIndex(assignedAt: request.assignedAt) ?? 0;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Request Progress',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          ...List.generate(_progressStepLabels.length, (index) {
            final isComplete = !isRejected && index < activeIndex;
            final isCurrent = !isRejected && index == activeIndex;
            final isFailed = isRejected && index == activeIndex;

            final icon = isFailed
                ? Icons.close_rounded
                : isComplete
                ? Icons.check_circle_rounded
                : isCurrent
                ? Icons.radio_button_checked_rounded
                : Icons.radio_button_unchecked_rounded;
            final color = isFailed
                ? DashboardColors.highPriority
                : isComplete || isCurrent
                ? DashboardColors.primary
                : DashboardColors.textMuted;

            return Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
              child: Row(
                children: [
                  Icon(icon, size: 18, color: color),
                  SizedBox(width: context.dashSpacing * 0.35),
                  Expanded(
                    child: Text(
                      _progressStepLabels[index],
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: isCurrent || isFailed
                            ? FontWeight.w700
                            : FontWeight.w500,
                        color: isComplete || isCurrent || isFailed
                            ? DashboardColors.textPrimary
                            : DashboardColors.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
          if (request.status != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              request.status!.subtitle,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _RejectionCard extends StatelessWidget {
  const _RejectionCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Request Not Accepted',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.highPriority,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            request.rejectionReason?.trim().isNotEmpty == true
                ? request.rejectionReason!.trim()
                : 'No rejection reason was provided.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ConvertedCard extends StatelessWidget {
  const _ConvertedCard({required this.patientId});

  final String patientId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Child Profile Active',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.primary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'The child profile is now active and ready for follow-up.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          FilledButton(
            onPressed: () => context.push(
              AppRoutes.parentChildDetail.replaceFirst(':childId', patientId),
            ),
            child: const Text('Open Child Profile'),
          ),
        ],
      ),
    );
  }
}

class _ChildInfoSection extends StatelessWidget {
  const _ChildInfoSection({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dobLabel = request.dateOfBirth != null
        ? DateFormat('MMM d, yyyy').format(request.dateOfBirth!)
        : 'Not provided';
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
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(label: 'Date of birth', value: dobLabel),
          _InfoRow(label: 'Gender', value: genderLabel),
          _InfoRow(
            label: 'Case description',
            value: request.caseDescription?.trim().isNotEmpty == true
                ? request.caseDescription!.trim()
                : 'Not provided',
          ),
          _InfoRow(
            label: 'Observed difficulties',
            value: request.observedDifficulties?.trim().isNotEmpty == true
                ? request.observedDifficulties!.trim()
                : 'Not provided',
          ),
          _InfoRow(
            label: 'Previous diagnosis',
            value: request.hasPreviousDiagnosis
                ? (request.previousDiagnosisDetails?.trim().isNotEmpty == true
                      ? request.previousDiagnosisDetails!.trim()
                      : 'Yes')
                : 'No',
          ),
          _InfoRow(
            label: 'Current treatment',
            value: request.isCurrentlyReceivingTreatment
                ? (request.currentTreatmentDetails?.trim().isNotEmpty == true
                      ? request.currentTreatmentDetails!.trim()
                      : 'Yes')
                : 'No',
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: theme.textTheme.labelLarge?.copyWith(
              color: DashboardColors.textMuted,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _SpecialistSection extends StatelessWidget {
  const _SpecialistSection({required this.request, this.onOpenConversation});

  final CaseIntakeRequest request;
  final VoidCallback? onOpenConversation;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final specialist = request.assignedSpecialist!;
    final imageUrl = ApiConstants.resolveProfileImageUrl(
      specialist.profileImageUrl,
    );

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Assigned Specialist',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: DashboardColors.purpleSoft,
                backgroundImage: imageUrl != null
                    ? CachedNetworkImageProvider(imageUrl)
                    : null,
                child: imageUrl == null
                    ? Icon(
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
                      specialist.fullName?.trim().isNotEmpty == true
                          ? specialist.fullName!.trim()
                          : 'Specialist',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (specialist.specialization?.trim().isNotEmpty == true)
                      Text(
                        specialist.specialization!.trim(),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          if (onOpenConversation != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            FilledButton.icon(
              onPressed: onOpenConversation,
              icon: const Icon(Icons.chat_bubble_outline_rounded),
              label: const Text('Open Conversation'),
            ),
          ],
        ],
      ),
    );
  }
}

class _AttachmentsSection extends StatelessWidget {
  const _AttachmentsSection({
    required this.request,
    required this.isUploading,
    required this.onAdd,
    required this.onOpen,
    required this.onDelete,
  });

  final CaseIntakeRequest request;
  final bool isUploading;
  final VoidCallback onAdd;
  final ValueChanged<CaseRequestAttachment> onOpen;
  final ValueChanged<CaseRequestAttachment> onDelete;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final attachments = request.attachments;

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
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'Supported: image, audio, video, PDF',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          if (attachments.isEmpty)
            Text(
              'No attachments yet.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            )
          else
            ...attachments.map(
              (attachment) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.45),
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
                    IconButton(
                      tooltip: 'Open',
                      onPressed: () => onOpen(attachment),
                      icon: const Icon(Icons.open_in_new_rounded),
                    ),
                    if (request.canEditAttachments)
                      IconButton(
                        tooltip: 'Delete',
                        onPressed: () => onDelete(attachment),
                        icon: Icon(
                          Icons.delete_outline_rounded,
                          color: DashboardColors.highPriority,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          if (request.canEditAttachments) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            if (isUploading)
              const LinearProgressIndicator()
            else
              OutlinedButton.icon(
                onPressed: onAdd,
                icon: const Icon(Icons.attach_file_rounded),
                label: const Text('Add Attachment'),
              ),
          ],
        ],
      ),
    );
  }

  IconData _attachmentIcon(CaseRequestAttachment attachment) {
    if (attachment.isImage) return Icons.image_outlined;
    if (attachment.isAudio) return Icons.audiotrack_outlined;
    if (attachment.isVideo) return Icons.videocam_outlined;
    if (attachment.isPdf) return Icons.picture_as_pdf_outlined;
    return Icons.insert_drive_file_outlined;
  }

  String _attachmentTypeLabel(CaseRequestAttachment attachment) {
    if (attachment.isImage) return 'Image';
    if (attachment.isAudio) return 'Audio';
    if (attachment.isVideo) return 'Video';
    if (attachment.isPdf) return 'PDF';
    return attachment.fileType ?? 'File';
  }
}
