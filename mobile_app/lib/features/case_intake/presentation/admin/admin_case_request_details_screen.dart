import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../dashboard/widgets/admin_page_scaffold.dart';
import '../../../dashboard/widgets/admin_ui_components.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../models/admin_case_request_detail_model.dart';
import '../../models/case_intake_request_model.dart';
import '../../models/case_request_attachment_model.dart';
import '../../providers/admin_case_request_detail_provider.dart';
import '../../widgets/case_request_status_chip.dart';

class AdminCaseRequestDetailsScreen extends ConsumerStatefulWidget {
  const AdminCaseRequestDetailsScreen({super.key, required this.requestId});

  final String requestId;

  @override
  ConsumerState<AdminCaseRequestDetailsScreen> createState() =>
      _AdminCaseRequestDetailsScreenState();
}

class _AdminCaseRequestDetailsScreenState
    extends ConsumerState<AdminCaseRequestDetailsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(adminCaseRequestDetailProvider(widget.requestId).notifier)
          .initialize();
    });
  }

  Future<void> _refresh() async {
    await ref
        .read(adminCaseRequestDetailProvider(widget.requestId).notifier)
        .refresh();
    if (!mounted) {
      return;
    }
    final error = ref
        .read(adminCaseRequestDetailProvider(widget.requestId))
        .errorMessage;
    if (error != null && error.isNotEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
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

  Future<void> _onAssignSpecialist() async {
    final assigned = await context.push<bool>(
      AppRoutes.adminCaseRequestAssign(widget.requestId),
    );
    if (!mounted || assigned != true) {
      return;
    }
    await ref
        .read(adminCaseRequestDetailProvider(widget.requestId).notifier)
        .refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminCaseRequestDetailProvider(widget.requestId));
    final detail = state.detail;
    final isInitialLoading = state.isLoading && detail == null;

    return AdminPageScaffold(
      title: 'Request Details',
      showBackButton: true,
      currentNav: DashboardNavItem.more,
      body: isInitialLoading
          ? const AdminLoadingCard(message: 'Loading request details...')
          : detail == null
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: context.dashPadding,
              children: [
                AdminErrorCard(
                  message: state.errorMessage ?? 'Case request not found.',
                  onRetry: () => ref
                      .read(
                        adminCaseRequestDetailProvider(
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
              onRefresh: _refresh,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  if (state.isRefreshing)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: LinearProgressIndicator(),
                    ),
                  if (state.errorMessage != null &&
                      state.errorMessage!.isNotEmpty &&
                      !state.isRefreshing) ...[
                    AdminErrorCard(
                      message: state.errorMessage!,
                      onRetry: () => ref
                          .read(
                            adminCaseRequestDetailProvider(
                              widget.requestId,
                            ).notifier,
                          )
                          .retry(),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  _HeaderCard(detail: detail),
                  SizedBox(height: context.dashSpacing),
                  _StatusTimelineCard(request: detail.request),
                  if (detail.request.status == CaseIntakeStatus.rejected) ...[
                    SizedBox(height: context.dashSpacing),
                    _RejectionCard(reason: detail.request.rejectionReason),
                  ],
                  if (detail.request.status ==
                      CaseIntakeStatus.convertedToPatient) ...[
                    SizedBox(height: context.dashSpacing),
                    _ConversionCard(patientId: detail.request.patientId),
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
                    onCopyEmail: () => _copyText('Email', detail.parent?.email),
                    onCopyPhone: () => _copyText('Phone', detail.parent?.phone),
                  ),
                  SizedBox(height: context.dashSpacing),
                  _AttachmentsCard(
                    attachments: detail.request.attachments,
                    onOpen: _openAttachment,
                  ),
                  SizedBox(height: context.dashSpacing),
                  _SpecialistCard(request: detail.request),
                  if (detail.assessmentNotes != null) ...[
                    SizedBox(height: context.dashSpacing),
                    _AssessmentNotesCard(notes: detail.assessmentNotes!),
                  ],
                  if (detail.request.conversationId != null &&
                      detail.request.conversationId!.isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing),
                    _ConversationIndicatorCard(
                      conversationId: detail.request.conversationId!,
                    ),
                  ],
                  if (detail.request.status == CaseIntakeStatus.pending) ...[
                    SizedBox(height: context.dashSpacing),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: _onAssignSpecialist,
                        child: const Text('Assign Specialist'),
                      ),
                    ),
                  ],
                  SizedBox(height: context.dashSpacing * 1.5),
                ],
              ),
            ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.detail});

  final AdminCaseRequestDetail detail;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final request = detail.request;
    final parentName = detail.parent?.fullName?.trim();
    final submittedLabel = request.submittedAt != null
        ? DateFormat('MMM d, yyyy').format(request.submittedAt!)
        : 'Unavailable';
    final shortId = _shortId(request.id);

    return AdminSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            request.childName,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: AdminDashboardColors.textPrimary,
            ),
          ),
          if (parentName != null && parentName.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              'Submitted by $parentName',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AdminDashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          if (request.category?.name != null &&
              request.category!.name.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              request.category!.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AdminDashboardColors.textSecondary,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.65),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              CaseRequestStatusChip(status: request.status),
              Text(
                'Submitted $submittedLabel',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: AdminDashboardColors.textMuted,
                ),
              ),
            ],
          ),
          if (shortId.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              'ID: $shortId',
              style: theme.textTheme.labelSmall?.copyWith(
                color: AdminDashboardColors.textMuted,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusTimelineCard extends StatelessWidget {
  const _StatusTimelineCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final steps = _buildTimelineSteps(request);

    return AdminSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Status Timeline',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: AdminDashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          ...steps.map((step) => _TimelineStepRow(step: step)),
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
  final status = request.status;
  final submittedSubtitle = request.submittedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.submittedAt!)
      : null;
  final assignedSubtitle = request.assignedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.assignedAt!)
      : null;
  final acceptedSubtitle = request.acceptedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.acceptedAt!)
      : null;
  final convertedSubtitle = request.convertedAt != null
      ? DateFormat('MMM d, yyyy · h:mm a').format(request.convertedAt!)
      : null;

  if (status == CaseIntakeStatus.rejected) {
    final assigned = request.assignedAt != null;
    return [
      _TimelineStepData(
        label: 'Submitted',
        visual: _TimelineVisual.completed,
        subtitle: submittedSubtitle,
      ),
      _TimelineStepData(
        label: 'Assigned',
        visual: assigned
            ? _TimelineVisual.completed
            : _TimelineVisual.incomplete,
        subtitle: assigned ? assignedSubtitle : null,
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

  switch (status) {
    case CaseIntakeStatus.assigned:
      return [
        _TimelineStepData(
          label: 'Submitted',
          visual: _TimelineVisual.completed,
          subtitle: submittedSubtitle,
        ),
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
    case CaseIntakeStatus.underAssessment:
      return [
        _TimelineStepData(
          label: 'Submitted',
          visual: _TimelineVisual.completed,
          subtitle: submittedSubtitle,
        ),
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
          label: 'Submitted',
          visual: _TimelineVisual.completed,
          subtitle: submittedSubtitle,
        ),
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
          label: 'Submitted',
          visual: _TimelineVisual.completed,
          subtitle: submittedSubtitle,
        ),
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
    case CaseIntakeStatus.pending:
    case null:
      return [
        _TimelineStepData(
          label: 'Submitted',
          visual: _TimelineVisual.current,
          subtitle: submittedSubtitle,
        ),
        const _TimelineStepData(
          label: 'Assigned',
          visual: _TimelineVisual.incomplete,
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

class _TimelineStepRow extends StatelessWidget {
  const _TimelineStepRow({required this.step});

  final _TimelineStepData step;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (icon, color) = switch (step.visual) {
      _TimelineVisual.completed => (
        Icons.check_circle_rounded,
        AdminDashboardColors.success,
      ),
      _TimelineVisual.current => (
        Icons.radio_button_checked_rounded,
        AdminDashboardColors.primary,
      ),
      _TimelineVisual.incomplete => (
        Icons.radio_button_unchecked_rounded,
        AdminDashboardColors.textMuted,
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
                        ? AdminDashboardColors.textPrimary
                        : AdminDashboardColors.textMuted,
                  ),
                ),
                if (step.subtitle != null && step.subtitle!.isNotEmpty)
                  Text(
                    step.subtitle!,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: AdminDashboardColors.textMuted,
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

    return AdminSurfaceCard(
      tint: AdminDashboardColors.danger,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.cancel_outlined,
                color: AdminDashboardColors.danger,
                size: 20,
              ),
              SizedBox(width: context.dashSpacing * 0.35),
              Expanded(
                child: Text(
                  'Request rejected',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AdminDashboardColors.danger,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          Text(
            text,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AdminDashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ConversionCard extends StatelessWidget {
  const _ConversionCard({this.patientId});

  final String? patientId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final shortPatientId = _shortId(patientId ?? '');

    return AdminSurfaceCard(
      tint: AdminDashboardColors.success,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.check_circle_outline_rounded,
                color: AdminDashboardColors.success,
                size: 20,
              ),
              SizedBox(width: context.dashSpacing * 0.35),
              Expanded(
                child: Text(
                  'Patient profile created successfully',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AdminDashboardColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          if (shortPatientId.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.4),
            Text(
              'Patient ID: $shortPatientId',
              style: theme.textTheme.labelSmall?.copyWith(
                color: AdminDashboardColors.textMuted,
              ),
            ),
          ],
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

    return AdminSurfaceCard(
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
    return AdminSurfaceCard(
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

    return AdminSurfaceCard(
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

  final AdminCaseRequestDetail detail;
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

    return AdminSurfaceCard(
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
                backgroundColor: AdminDashboardColors.blueSoft,
                backgroundImage: imageUrl != null
                    ? CachedNetworkImageProvider(imageUrl)
                    : null,
                child: imageUrl == null
                    ? const Icon(
                        Icons.person_outline_rounded,
                        color: AdminDashboardColors.primary,
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
                  color: AdminDashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                value,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: AdminDashboardColors.textSecondary,
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

    return AdminSurfaceCard(
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
                color: AdminDashboardColors.textSecondary,
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
                      color: AdminDashboardColors.primary,
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
                              color: AdminDashboardColors.textMuted,
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

class _SpecialistCard extends StatelessWidget {
  const _SpecialistCard({required this.request});

  final CaseIntakeRequest request;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final specialist = request.assignedSpecialist;
    final hasSpecialist =
        specialist != null &&
        (specialist.id.isNotEmpty ||
            (specialist.fullName?.trim().isNotEmpty ?? false));
    final isPending = request.status == CaseIntakeStatus.pending;

    return AdminSurfaceCard(
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
          if (!hasSpecialist)
            Text(
              isPending
                  ? 'No specialist assigned yet.'
                  : 'No specialist assigned.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AdminDashboardColors.textSecondary,
              ),
            )
          else
            Row(
              children: [
                Builder(
                  builder: (context) {
                    final imageUrl = ApiConstants.resolveProfileImageUrl(
                      specialist.profileImageUrl,
                    );
                    return CircleAvatar(
                      radius: 24,
                      backgroundColor: AdminDashboardColors.blueSoft,
                      backgroundImage: imageUrl != null
                          ? CachedNetworkImageProvider(imageUrl)
                          : null,
                      child: imageUrl == null
                          ? const Icon(
                              Icons.badge_outlined,
                              color: AdminDashboardColors.primary,
                            )
                          : null,
                    );
                  },
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
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (specialist.specialization?.trim().isNotEmpty == true)
                        Text(
                          specialist.specialization!.trim(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: AdminDashboardColors.textSecondary,
                          ),
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

class _AssessmentNotesCard extends StatelessWidget {
  const _AssessmentNotesCard({required this.notes});

  final String notes;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AdminSurfaceCard(
      tint: AdminDashboardColors.warning,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Internal Preliminary Assessment Notes',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            'Visible to admin only',
            style: theme.textTheme.labelSmall?.copyWith(
              color: AdminDashboardColors.textMuted,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            notes,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AdminDashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ConversationIndicatorCard extends StatelessWidget {
  const _ConversationIndicatorCard({required this.conversationId});

  final String conversationId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final shortId = _shortId(conversationId);

    return AdminSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.forum_outlined,
                size: 20,
                color: AdminDashboardColors.primary,
              ),
              SizedBox(width: context.dashSpacing * 0.35),
              Expanded(
                child: Text(
                  'Conversation created',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          if (shortId.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'Conversation ID: $shortId',
              style: theme.textTheme.labelSmall?.copyWith(
                color: AdminDashboardColors.textMuted,
              ),
            ),
          ],
        ],
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
              color: AdminDashboardColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            value,
            maxLines: allowWrap ? null : 3,
            overflow: allowWrap ? TextOverflow.visible : TextOverflow.ellipsis,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: AdminDashboardColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

String _shortId(String id) {
  final trimmed = id.trim();
  if (trimmed.isEmpty) {
    return '';
  }
  if (trimmed.length <= 8) {
    return trimmed;
  }
  return trimmed.substring(0, 8);
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
