import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/admin_page_scaffold.dart';
import '../../../dashboard/widgets/admin_ui_components.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../models/complaint_models.dart';
import '../../providers/admin_complaints_provider.dart';
import '../complaint_localization_utils.dart';
import '../widgets/complaint_status_chip.dart';

class AdminComplaintDetailsScreen extends ConsumerStatefulWidget {
  const AdminComplaintDetailsScreen({super.key, required this.complaintId});

  final String complaintId;

  @override
  ConsumerState<AdminComplaintDetailsScreen> createState() =>
      _AdminComplaintDetailsScreenState();
}

class _AdminComplaintDetailsScreenState
    extends ConsumerState<AdminComplaintDetailsScreen> {
  final _adminNotesController = TextEditingController();
  final _parentResponseController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(adminComplaintDetailProvider(widget.complaintId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _adminNotesController.dispose();
    _parentResponseController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    await ref
        .read(adminComplaintDetailProvider(widget.complaintId).notifier)
        .refresh();
  }

  Future<void> _confirmAction({
    required String title,
    required String message,
    required Future<ComplaintItem?> Function() action,
    required String successMessage,
  }) async {
    final l10n = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.commonCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(l10n.commonConfirm),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    final result = await action();
    if (!mounted) return;

    if (result != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(successMessage)));
      if (context.canPop()) {
        context.pop(true);
      }
      return;
    }

    final error = ref
        .read(adminComplaintDetailProvider(widget.complaintId))
        .errorMessage;
    if (error != null && error.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapAdminComplaintError(l10n, error))),
      );
    }
  }

  Future<void> _startReview() async {
    final l10n = AppLocalizations.of(context)!;
    await _confirmAction(
      title: l10n.adminComplaintStartReviewTitle,
      message: l10n.adminComplaintStartReviewMessage,
      successMessage: l10n.adminComplaintStartReviewSuccess,
      action: () => ref
          .read(adminComplaintDetailProvider(widget.complaintId).notifier)
          .startReview(),
    );
  }

  Future<void> _resolve() async {
    final l10n = AppLocalizations.of(context)!;
    final notes = _adminNotesController.text.trim();
    if (notes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.adminComplaintAdminNotesRequired)),
      );
      return;
    }

    await _confirmAction(
      title: l10n.adminComplaintResolveTitle,
      message: l10n.adminComplaintResolveMessage,
      successMessage: l10n.adminComplaintResolveSuccess,
      action: () => ref
          .read(adminComplaintDetailProvider(widget.complaintId).notifier)
          .resolve(
            adminNotes: notes,
            parentResponse: _parentResponseController.text.trim().isEmpty
                ? null
                : _parentResponseController.text.trim(),
          ),
    );
  }

  Future<void> _reject() async {
    final l10n = AppLocalizations.of(context)!;
    final notes = _adminNotesController.text.trim();
    if (notes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.adminComplaintAdminNotesRequired)),
      );
      return;
    }

    await _confirmAction(
      title: l10n.adminComplaintRejectTitle,
      message: l10n.adminComplaintRejectMessage,
      successMessage: l10n.adminComplaintRejectSuccess,
      action: () => ref
          .read(adminComplaintDetailProvider(widget.complaintId).notifier)
          .reject(
            adminNotes: notes,
            parentResponse: _parentResponseController.text.trim().isEmpty
                ? null
                : _parentResponseController.text.trim(),
          ),
    );
  }

  Future<void> _openAttachment(String? url) async {
    final l10n = AppLocalizations.of(context)!;
    final resolved = ApiConstants.resolveMediaUrl(url);
    if (resolved == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.attachmentUnableToOpen)),
      );
      return;
    }
    final uri = Uri.tryParse(resolved);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(adminComplaintDetailProvider(widget.complaintId));
    final theme = Theme.of(context);

    if (state.isLoading && state.complaint == null) {
      return AdminPageScaffold(
        title: l10n.adminComplaintDetailsTitle,
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        body: AdminLoadingCard(message: l10n.adminComplaintsLoading),
      );
    }

    if (state.errorMessage != null && state.complaint == null) {
      return AdminPageScaffold(
        title: l10n.adminComplaintDetailsTitle,
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        body: AdminErrorCard(
          message: mapAdminComplaintError(l10n, state.errorMessage!),
          onRetry: _refresh,
        ),
      );
    }

    final complaint = state.complaint;
    if (complaint == null) {
      return AdminPageScaffold(
        title: l10n.adminComplaintDetailsTitle,
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        body: AdminEmptyCard(message: l10n.complaintDetailsNotFound),
      );
    }

    final createdLabel = complaint.createdAt == null
        ? l10n.complaintDateUnavailable
        : DateFormat.yMMMd().add_jm().format(complaint.createdAt!);

    return AdminPageScaffold(
      title: l10n.adminComplaintDetailsTitle,
      showBackButton: true,
      currentNav: DashboardNavItem.more,
      body: ListView(
        padding: context.dashPadding,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  localizedComplaintCategoryLabel(l10n, complaint.category),
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              ComplaintStatusChip(status: complaint.status),
            ],
          ),
          SizedBox(height: context.dashSpacing),
          _InfoTile(label: l10n.adminComplaintFieldParent, value: complaint.parent.fullName),
          _InfoTile(label: l10n.adminComplaintFieldChild, value: complaint.patient.fullName),
          _InfoTile(label: l10n.adminComplaintFieldSpecialist, value: complaint.specialist.fullName),
          _InfoTile(label: l10n.complaintDetailsSubmitted, value: createdLabel),
          if (complaint.reviewer != null)
            _InfoTile(
              label: l10n.adminComplaintReviewer,
              value: complaint.reviewer!.fullName,
            ),
          if (complaint.reviewedAt != null)
            _InfoTile(
              label: l10n.adminComplaintReviewedAt,
              value: DateFormat.yMMMd().add_jm().format(complaint.reviewedAt!),
            ),
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            l10n.complaintFormDescriptionLabel,
            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          DashboardSurfaceCard(child: Text(complaint.description)),
          if (complaint.attachmentUrl != null &&
              complaint.attachmentUrl!.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              l10n.complaintFormAttachmentLabel,
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            DashboardSurfaceCard(
              onTap: () => _openAttachment(complaint.attachmentUrl),
              child: Row(
                children: [
                  Icon(
                    complaint.attachmentUrl!.toLowerCase().endsWith('.pdf')
                        ? Icons.picture_as_pdf_outlined
                        : Icons.image_outlined,
                  ),
                  SizedBox(width: context.dashSpacing * 0.4),
                  Expanded(child: Text(complaint.attachmentUrl!.split('/').last)),
                  const Icon(Icons.open_in_new_rounded),
                ],
              ),
            ),
          ],
          if (complaint.adminNotes != null &&
              complaint.adminNotes!.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              l10n.adminComplaintAdminNotes,
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            DashboardSurfaceCard(child: Text(complaint.adminNotes!.trim())),
          ],
          if (complaint.status == ComplaintStatus.pending ||
              complaint.status == ComplaintStatus.underReview) ...[
            SizedBox(height: context.dashSpacing),
            TextField(
              controller: _adminNotesController,
              minLines: 3,
              maxLines: 5,
              decoration: InputDecoration(
                labelText: l10n.adminComplaintAdminNotes,
                hintText: l10n.adminComplaintAdminNotesHint,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            TextField(
              controller: _parentResponseController,
              minLines: 2,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: l10n.adminComplaintParentResponse,
                hintText: l10n.adminComplaintParentResponseHint,
              ),
            ),
            SizedBox(height: context.dashSpacing),
            if (complaint.status == ComplaintStatus.pending)
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: state.isSubmitting ? null : _startReview,
                  child: Text(l10n.adminComplaintStartReview),
                ),
              ),
            if (complaint.status == ComplaintStatus.underReview) ...[
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: state.isSubmitting ? null : _resolve,
                  child: Text(l10n.adminComplaintResolve),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: state.isSubmitting ? null : _reject,
                  child: Text(l10n.adminComplaintReject),
                ),
              ),
            ],
            if (complaint.status == ComplaintStatus.pending) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: state.isSubmitting ? null : _reject,
                  child: Text(l10n.adminComplaintReject),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final displayLabel = label.endsWith(': ') || label.endsWith(':')
        ? label
        : '$label:';
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              displayLabel,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
