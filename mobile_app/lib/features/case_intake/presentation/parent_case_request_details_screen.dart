import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../dashboard/models/communication_models.dart';
import '../../dashboard/presentation/communication/communication_attachment_picker.dart';
import '../../dashboard/widgets/dashboard_components.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../dashboard/widgets/parent_page_scaffold.dart';
import '../models/case_intake_request_model.dart';
import '../models/case_request_attachment_model.dart';
import 'parent_case_intake_localization_utils.dart';
import '../providers/parent_case_intake_provider.dart';
import '../widgets/case_request_status_chip.dart';

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
            SnackBar(
              content: Text(
                AppLocalizations.of(
                  context,
                )!.parentCaseRequestDetailsAttachmentUploaded,
              ),
            ),
          );
        } else {
          final error = ref.read(parentCaseIntakeProvider).errorMessage;
          if (error != null && error.isNotEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  mapParentCaseIntakeProviderError(
                    AppLocalizations.of(context)!,
                    error,
                  ),
                ),
              ),
            );
          }
        }
      },
    );
  }

  Future<void> _deleteAttachment(
    CaseIntakeRequest request,
    CaseRequestAttachment attachment,
  ) async {
    final l10n = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.parentCaseRequestDetailsDeleteAttachmentTitle),
        content: Text(
          l10n.parentCaseRequestDetailsDeleteAttachmentMessage(
            attachment.displayName,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(l10n.commonDelete),
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.parentCaseRequestDetailsAttachmentDeleted)),
      );
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
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.parentDashboardConversationUnavailable,
          ),
        ),
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
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(parentCaseIntakeProvider);
    final request = state.selectedRequest;
    final isInitialLoading =
        state.isLoading && (request == null || request.id != widget.requestId);

    return ParentPageScaffold(
      title: l10n.parentCaseRequestDetailsTitle,
      showBackButton: true,
      actions: request != null && request.canEdit
          ? [
              IconButton(
                tooltip: l10n.parentCaseRequestDetailsEditTooltip,
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
              message: mapParentCaseIntakeProviderError(
                l10n,
                state.errorMessage ?? l10n.parentCaseRequestDetailsNotFound,
              ),
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
                      message: mapParentCaseIntakeProviderError(
                        l10n,
                        state.errorMessage!,
                      ),
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
    final l10n = AppLocalizations.of(context)!;
    final submittedLabel = request.submittedAt != null
        ? DateFormat('MMM d, yyyy').format(request.submittedAt!)
        : l10n.parentCaseRequestDetailsUnavailable;
    final statusLabel = localizedCaseIntakeStatusLabel(l10n, request.status);

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
              CaseRequestStatusChip(status: request.status, label: statusLabel),
              const Spacer(),
              Text(
                l10n.parentDashboardCaseSubmittedOn(submittedLabel),
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
    final l10n = AppLocalizations.of(context)!;
    final progressStepLabels = parentCaseRequestProgressStepLabels(l10n);
    final isRejected = request.status == CaseIntakeStatus.rejected;
    final activeIndex =
        request.status?.progressStepIndex(assignedAt: request.assignedAt) ?? 0;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsProgressTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          ...List.generate(progressStepLabels.length, (index) {
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
                ? DashboardColors.brandCyan
                : DashboardColors.textMuted;

            return Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
              child: Row(
                children: [
                  Icon(icon, size: 18, color: color),
                  SizedBox(width: context.dashSpacing * 0.35),
                  Expanded(
                    child: Text(
                      progressStepLabels[index],
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
              localizedCaseIntakeStatusSubtitle(l10n, request.status!),
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
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsNotAcceptedTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.highPriority,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            request.rejectionReason?.trim().isNotEmpty == true
                ? request.rejectionReason!.trim()
                : l10n.parentDashboardCaseNoRejectionReason,
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
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsChildProfileActiveTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.brandCyan,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.parentCaseRequestDetailsChildProfileActiveMessage,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          SizedBox(
            width: double.infinity,
            child: BrandGradientButton(
              onPressed: () => context.push(
                AppRoutes.parentChildDetail.replaceFirst(':childId', patientId),
              ),
              label: l10n.parentCaseRequestDetailsOpenChildProfile,
            ),
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
    final l10n = AppLocalizations.of(context)!;
    final notProvided = l10n.specialistSessionNotProvided;
    final dobLabel = request.dateOfBirth != null
        ? DateFormat('MMM d, yyyy').format(request.dateOfBirth!)
        : notProvided;
    final genderLabel = localizedCaseIntakeGenderFromApi(l10n, request.gender);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsChildInformation,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _InfoRow(label: l10n.fieldDateOfBirth, value: dobLabel),
          _InfoRow(label: l10n.fieldGender, value: genderLabel),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsCaseDescription,
            value: request.caseDescription?.trim().isNotEmpty == true
                ? request.caseDescription!.trim()
                : notProvided,
          ),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsObservedDifficulties,
            value: request.observedDifficulties?.trim().isNotEmpty == true
                ? request.observedDifficulties!.trim()
                : notProvided,
          ),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsPreviousDiagnosis,
            value: request.hasPreviousDiagnosis
                ? (request.previousDiagnosisDetails?.trim().isNotEmpty == true
                      ? request.previousDiagnosisDetails!.trim()
                      : l10n.commonYes)
                : l10n.commonNo,
          ),
          _InfoRow(
            label: l10n.parentCaseRequestDetailsCurrentTreatment,
            value: request.isCurrentlyReceivingTreatment
                ? (request.currentTreatmentDetails?.trim().isNotEmpty == true
                      ? request.currentTreatmentDetails!.trim()
                      : l10n.commonYes)
                : l10n.commonNo,
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
    final l10n = AppLocalizations.of(context)!;
    final specialist = request.assignedSpecialist!;
    final imageUrl = ApiConstants.resolveProfileImageUrl(
      specialist.profileImageUrl,
    );

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestDetailsAssignedSpecialist,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: DashboardColors.brandSoft,
                backgroundImage: imageUrl != null
                    ? CachedNetworkImageProvider(imageUrl)
                    : null,
                child: imageUrl == null
                    ? Icon(
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
                      specialist.fullName?.trim().isNotEmpty == true
                          ? specialist.fullName!.trim()
                          : l10n.roleSpecialist,
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
            SizedBox(
              width: double.infinity,
              child: BrandGradientButton(
                onPressed: onOpenConversation,
                icon: Icons.chat_bubble_outline_rounded,
                label: l10n.parentDashboardCaseOpenConversation,
              ),
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
    final l10n = AppLocalizations.of(context)!;
    final attachments = request.attachments;

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
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.parentCaseRequestDetailsAttachmentsHint,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          if (attachments.isEmpty)
            Text(
              l10n.parentCaseRequestDetailsNoAttachments,
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
                    IconButton(
                      tooltip: l10n.commonOpen,
                      onPressed: () => onOpen(attachment),
                      icon: const Icon(Icons.open_in_new_rounded),
                    ),
                    if (request.canEditAttachments)
                      IconButton(
                        tooltip: l10n.commonDelete,
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
                style: brandOutlinedButtonStyle(),
                icon: const Icon(Icons.attach_file_rounded),
                label: Text(l10n.parentCaseRequestDetailsAddAttachment),
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
}
