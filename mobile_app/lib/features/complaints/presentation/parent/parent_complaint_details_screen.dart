import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/parent_page_scaffold.dart';
import '../../data/complaints_repository.dart';
import '../../models/complaint_models.dart';
import '../complaint_localization_utils.dart';
import '../widgets/complaint_status_chip.dart';

class ParentComplaintDetailsScreen extends ConsumerStatefulWidget {
  const ParentComplaintDetailsScreen({super.key, required this.complaintId});

  final String complaintId;

  @override
  ConsumerState<ParentComplaintDetailsScreen> createState() =>
      _ParentComplaintDetailsScreenState();
}

class _ParentComplaintDetailsScreenState
    extends ConsumerState<ParentComplaintDetailsScreen> {
  ComplaintItem? _complaint;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final complaint = await ref
          .read(complaintsRepositoryProvider)
          .fetchMyComplaintById(widget.complaintId);
      if (!mounted) return;
      setState(() {
        _complaint = complaint;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = error.toString();
      });
    }
  }

  Future<void> _openAttachment(String? url) async {
    final l10n = AppLocalizations.of(context)!;
    final resolved = ApiConstants.resolveMediaUrl(url);
    if (resolved == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.attachmentUnableToOpen)));
      return;
    }
    final uri = Uri.tryParse(resolved);
    if (uri == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.attachmentUnableToOpen)));
      return;
    }
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    if (_isLoading) {
      return ParentPageScaffold(
        title: l10n.complaintDetailsTitle,
        showBackButton: true,
        body: const Center(child: DashboardLoadingCard()),
      );
    }

    if (_errorMessage != null || _complaint == null) {
      return ParentPageScaffold(
        title: l10n.complaintDetailsTitle,
        showBackButton: true,
        body: DashboardErrorCard(
          message: _errorMessage ?? l10n.complaintDetailsNotFound,
          onRetry: _load,
        ),
      );
    }

    final complaint = _complaint!;
    final createdLabel = complaint.createdAt == null
        ? l10n.complaintDateUnavailable
        : DateFormat.yMMMd().add_jm().format(complaint.createdAt!);

    return ParentPageScaffold(
      title: l10n.complaintDetailsTitle,
      showBackButton: true,
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
          _DetailRow(
            label: l10n.complaintFormChildLabel,
            value: complaint.patient.fullName,
          ),
          _DetailRow(
            label: l10n.complaintFormSpecialistLabel,
            value: complaint.specialist.fullName,
          ),
          _DetailRow(
            label: l10n.complaintDetailsSubmitted,
            value: createdLabel,
          ),
          _DetailRow(
            label: l10n.complaintDetailsStatus,
            value: localizedComplaintStatusLabel(l10n, complaint.status),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            l10n.complaintFormDescriptionLabel,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          DashboardSurfaceCard(
            child: Text(
              complaint.description,
              style: theme.textTheme.bodyMedium,
            ),
          ),
          if (complaint.parentResponse != null &&
              complaint.parentResponse!.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              l10n.complaintDetailsAdminResponse,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            DashboardSurfaceCard(
              child: Text(
                complaint.parentResponse!.trim(),
                style: theme.textTheme.bodyMedium,
              ),
            ),
          ],
          if (complaint.attachmentUrl != null &&
              complaint.attachmentUrl!.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              l10n.complaintFormAttachmentLabel,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            _AttachmentPreview(
              url: complaint.attachmentUrl!,
              onOpen: () => _openAttachment(complaint.attachmentUrl),
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _AttachmentPreview extends StatelessWidget {
  const _AttachmentPreview({required this.url, required this.onOpen});

  final String url;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final resolved = ApiConstants.resolveMediaUrl(url);
    final isPdf = url.toLowerCase().endsWith('.pdf');

    if (isPdf || resolved == null) {
      return DashboardSurfaceCard(
        onTap: onOpen,
        child: Row(
          children: [
            const Icon(Icons.picture_as_pdf_outlined),
            SizedBox(width: context.dashSpacing * 0.4),
            Expanded(child: Text(url.split('/').last)),
            const Icon(Icons.open_in_new_rounded),
          ],
        ),
      );
    }

    return DashboardSurfaceCard(
      onTap: onOpen,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: CachedNetworkImage(
          imageUrl: resolved,
          fit: BoxFit.cover,
          height: 180,
          width: double.infinity,
        ),
      ),
    );
  }
}
