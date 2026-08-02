import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_reports_widgets.dart';

class SpecialistReportDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistReportDetailsScreen({
    super.key,
    required this.reportId,
    this.isAiReport = false,
    this.useAdminChrome = false,
  });

  final String reportId;
  final bool isAiReport;
  final bool useAdminChrome;

  @override
  ConsumerState<SpecialistReportDetailsScreen> createState() =>
      _SpecialistReportDetailsScreenState();
}

class _SpecialistReportDetailsScreenState
    extends ConsumerState<SpecialistReportDetailsScreen> {
  late final SpecialistReportDetailArgs _args;

  @override
  void initState() {
    super.initState();
    _args = (reportId: widget.reportId, isAiReport: widget.isAiReport);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistReportDetailProvider(_args).notifier).initialize();
    });
  }

  String? _resolvedPdfUrl(String? pdfUrl) {
    if (pdfUrl == null || pdfUrl.trim().isEmpty) {
      return null;
    }
    return ApiConstants.resolveMediaUrl(pdfUrl) ?? pdfUrl;
  }

  Future<void> _copyPdfLink(String pdfUrl) async {
    final resolved = _resolvedPdfUrl(pdfUrl);
    if (resolved == null) {
      return;
    }

    await Clipboard.setData(ClipboardData(text: resolved));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('PDF link copied to clipboard')),
    );
  }

  Future<void> _viewPdf(String pdfUrl) async {
    final resolved = _resolvedPdfUrl(pdfUrl);
    if (resolved == null) {
      return;
    }

    final uri = Uri.tryParse(resolved);
    if (uri != null && await canLaunchUrl(uri)) {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) {
        await _copyPdfLink(pdfUrl);
      }
      return;
    }

    await _copyPdfLink(pdfUrl);
  }

  Future<void> _generatePdf() async {
    final notifier = ref.read(specialistReportDetailProvider(_args).notifier);
    final success = await notifier.generatePdf();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('PDF generated successfully')),
      );
      return;
    }

    final error = ref.read(specialistReportDetailProvider(_args)).errorMessage;
    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistReportDetailProvider(_args));
    final notifier = ref.read(specialistReportDetailProvider(_args).notifier);
    final detail = state.detail;
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && detail == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.initialize,
        ),
      );
    } else if (detail == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Report not found.'),
      );
    } else {
      final sections = detail.sections;
      final pdfUrl = detail.pdfUrl;
      final hasPdf = detail.hasPdf;

      body = SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SpecialistReportHeaderCard(detail: detail),
            SizedBox(height: context.dashSpacing * 0.75),
            SpecialistReportInformationCard(detail: detail),
            if (sections.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing),
              ...sections.map(
                (section) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: SpecialistReportSectionCard(section: section),
                ),
              ),
            ],
            if (hasPdf && pdfUrl != null && pdfUrl.trim().isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.4),
              Text(
                'Attachments',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              SpecialistReportAttachmentCard(pdfUrl: pdfUrl),
              SizedBox(height: context.dashSpacing),
              ElevatedButton.icon(
                onPressed: () => _viewPdf(pdfUrl),
                icon: const Icon(Icons.picture_as_pdf_outlined),
                label: const Text('View PDF'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.brandCyan,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              OutlinedButton.icon(
                onPressed: () => _copyPdfLink(pdfUrl),
                icon: const Icon(Icons.link_rounded),
                label: const Text('Copy PDF Link'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.brandCyan,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  side: const BorderSide(color: DashboardColors.brandCyan),
                ),
              ),
            ] else ...[
              SizedBox(height: context.dashSpacing),
              ElevatedButton.icon(
                onPressed: state.isExporting ? null : _generatePdf,
                icon: state.isExporting
                    ? SizedBox(
                        width: context.dashSpacing * 0.55,
                        height: context.dashSpacing * 0.55,
                        child: const CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.picture_as_pdf_outlined),
                label: Text(
                  state.isExporting ? 'Generating PDF...' : 'Generate PDF',
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.brandCyan,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ],
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    if (widget.useAdminChrome) {
      return AdminPageScaffold(
        title: 'Report Details',
        showBackButton: true,
        showBottomNav: false,
        body: body,
      );
    }

    return SpecialistPageScaffold(
      title: 'Report Details',
      showBackButton: true,
      body: body,
    );
  }
}
