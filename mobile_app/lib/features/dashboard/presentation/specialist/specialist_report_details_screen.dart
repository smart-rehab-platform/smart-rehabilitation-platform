import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_ai_report_structured_summary.dart';
import '../../models/specialist_reports_models.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_ai_report_edit_widgets.dart';
import 'specialist_ai_report_section_labels.dart';
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
  bool _isEditing = false;
  final Map<String, TextEditingController> _draftControllers = {};

  @override
  void initState() {
    super.initState();
    _args = (reportId: widget.reportId, isAiReport: widget.isAiReport);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistReportDetailProvider(_args).notifier).initialize();
    });
  }

  @override
  void dispose() {
    _disposeDraftControllers();
    super.dispose();
  }

  void _disposeDraftControllers() {
    for (final controller in _draftControllers.values) {
      controller.dispose();
    }
    _draftControllers.clear();
  }

  TextDirection _contentDirection(SpecialistReportDetail detail) {
    return detail.isAiReport && detail.language == 'ar'
        ? TextDirection.rtl
        : TextDirection.ltr;
  }

  void _startEditing(SpecialistReportDetail detail) {
    _disposeDraftControllers();
    final form = detail.aiStructuredSummary.toDraftFormMap();
    for (final fieldId in specialistAiReportEditableFieldIds()) {
      _draftControllers[fieldId] = TextEditingController(text: form[fieldId] ?? '');
    }
    setState(() => _isEditing = true);
  }

  void _cancelEditing() {
    _disposeDraftControllers();
    setState(() => _isEditing = false);
  }

  Future<void> _saveDraft(AppLocalizations l10n) async {
    final form = <String, String>{};
    for (final entry in _draftControllers.entries) {
      form[entry.key] = entry.value.text;
    }

    if (!SpecialistAiReportStructuredSummary.hasClinicalContent(form)) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistReportEditEmptyContent)),
      );
      return;
    }

    final notifier = ref.read(specialistReportDetailProvider(_args).notifier);
    final success = await notifier.saveAiReportDraft(
      SpecialistAiReportStructuredSummary.buildUpdatePayload(form),
    );
    if (!mounted) return;

    if (success) {
      _cancelEditing();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistReportSaveChangesSuccess)),
      );
      return;
    }

    final error = ref.read(specialistReportDetailProvider(_args)).errorMessage ??
        l10n.specialistReportSaveChangesFailed;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(error)),
    );
  }

  String? _resolvedPdfUrl(String? pdfUrl) {
    if (pdfUrl == null || pdfUrl.trim().isEmpty) {
      return null;
    }
    return ApiConstants.resolveMediaUrl(pdfUrl) ?? pdfUrl;
  }

  Future<void> _copyPdfLink(AppLocalizations l10n, String pdfUrl) async {
    final resolved = _resolvedPdfUrl(pdfUrl);
    if (resolved == null) {
      return;
    }

    await Clipboard.setData(ClipboardData(text: resolved));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.specialistReportPdfLinkCopied)),
    );
  }

  Future<void> _viewPdf(AppLocalizations l10n, String pdfUrl) async {
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
        await _copyPdfLink(l10n, pdfUrl);
      }
      return;
    }

    await _copyPdfLink(l10n, pdfUrl);
  }

  Future<void> _generatePdf(
    AppLocalizations l10n, {
    required bool isAiApproval,
  }) async {
    if (_isEditing) {
      return;
    }

    final notifier = ref.read(specialistReportDetailProvider(_args).notifier);
    final success = await notifier.generatePdf();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isAiApproval
                ? l10n.specialistReportApprovedSuccess
                : l10n.specialistReportPdfGeneratedSuccess,
          ),
        ),
      );
      await _refreshReportsList(ref.read(specialistReportDetailProvider(_args)).detail);
      return;
    }

    final error = ref.read(specialistReportDetailProvider(_args)).errorMessage;
    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  Future<bool> _confirmDiscard(AppLocalizations l10n) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.specialistReportDiscardConfirmTitle),
          content: Text(l10n.specialistReportDiscardConfirmBody),
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
              child: Text(l10n.specialistReportDiscardConfirmAction),
            ),
          ],
        );
      },
    );
    return confirmed == true;
  }

  Future<void> _refreshReportsList(SpecialistReportDetail? detail) async {
    final patientId = detail?.patientId.trim();
    final global = ref.read(specialistReportsProvider(null).notifier);
    await global.refresh();
    if (patientId != null && patientId.isNotEmpty) {
      await ref.read(specialistReportsProvider(patientId).notifier).refresh();
    }
  }

  Future<void> _discardReport(AppLocalizations l10n) async {
    final state = ref.read(specialistReportDetailProvider(_args));
    if (state.isDiscarding || state.isExporting || state.isSavingDraft || _isEditing) {
      return;
    }

    final confirmed = await _confirmDiscard(l10n);
    if (!confirmed || !mounted) {
      return;
    }

    final detail = state.detail;
    final notifier = ref.read(specialistReportDetailProvider(_args).notifier);
    final success = await notifier.discardAiReport();
    if (!mounted) return;

    if (!success) {
      final error =
          ref.read(specialistReportDetailProvider(_args)).errorMessage ??
              l10n.specialistReportDiscardFailed;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error)),
      );
      return;
    }

    await _refreshReportsList(detail);
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.specialistReportDiscardSuccess)),
    );
    if (context.canPop()) {
      context.pop();
    }
  }

  List<Widget> _buildBottomActions({
    required AppLocalizations l10n,
    required SpecialistReportDetail detail,
    required SpecialistReportDetailState state,
  }) {
    final pdfUrl = detail.pdfUrl;
    final busy = state.isExporting ||
        state.isDiscarding ||
        state.isSavingDraft ||
        _isEditing;

    if (detail.hasPdf && pdfUrl != null && pdfUrl.trim().isNotEmpty) {
      return [
        SizedBox(height: context.dashSpacing),
        ElevatedButton.icon(
          onPressed: busy ? null : () => _viewPdf(l10n, pdfUrl),
          icon: const Icon(Icons.picture_as_pdf_outlined),
          label: Text(l10n.specialistReportViewPdf),
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
          onPressed: busy ? null : () => _copyPdfLink(l10n, pdfUrl),
          icon: const Icon(Icons.link_rounded),
          label: Text(l10n.specialistReportCopyPdfLink),
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
      ];
    }

    if (detail.isAwaitingReview) {
      if (_isEditing) {
        return [
          SizedBox(height: context.dashSpacing),
          ElevatedButton.icon(
            onPressed: state.isSavingDraft ? null : () => _saveDraft(l10n),
            icon: state.isSavingDraft
                ? SizedBox(
                    width: context.dashSpacing * 0.55,
                    height: context.dashSpacing * 0.55,
                    child: const CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.save_outlined),
            label: Text(
              state.isSavingDraft
                  ? l10n.specialistReportSavingChanges
                  : l10n.specialistReportSaveChanges,
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
          SizedBox(height: context.dashSpacing * 0.5),
          OutlinedButton.icon(
            onPressed: state.isSavingDraft ? null : _cancelEditing,
            icon: const Icon(Icons.close_rounded),
            label: Text(l10n.specialistReportCancelEditing),
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
        ];
      }

      return [
        SizedBox(height: context.dashSpacing),
        OutlinedButton.icon(
          onPressed: busy ? null : () => _startEditing(detail),
          icon: const Icon(Icons.edit_outlined),
          label: Text(l10n.specialistReportEditReport),
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
        SizedBox(height: context.dashSpacing * 0.5),
        ElevatedButton.icon(
          onPressed: busy
              ? null
              : () => _generatePdf(l10n, isAiApproval: true),
          icon: state.isExporting
              ? SizedBox(
                  width: context.dashSpacing * 0.55,
                  height: context.dashSpacing * 0.55,
                  child: const CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.check_circle_outline),
          label: Text(
            state.isExporting
                ? l10n.specialistReportApprovingPdf
                : l10n.specialistReportApproveAndGeneratePdf,
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
        SizedBox(height: context.dashSpacing * 0.5),
        OutlinedButton.icon(
          onPressed: busy ? null : () => _discardReport(l10n),
          icon: state.isDiscarding
              ? SizedBox(
                  width: context.dashSpacing * 0.55,
                  height: context.dashSpacing * 0.55,
                  child: const CircularProgressIndicator(
                    strokeWidth: 2,
                    color: DashboardColors.highPriority,
                  ),
                )
              : const Icon(Icons.delete_outline_rounded),
          label: Text(
            state.isDiscarding
                ? l10n.specialistReportDiscarding
                : l10n.specialistReportDiscard,
          ),
          style: OutlinedButton.styleFrom(
            foregroundColor: DashboardColors.highPriority,
            padding: EdgeInsets.symmetric(
              vertical: context.dashSpacing * 0.65,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            side: const BorderSide(color: DashboardColors.highPriority),
          ),
        ),
      ];
    }

    // Regular report without PDF — keep existing Generate PDF action.
    return [
      SizedBox(height: context.dashSpacing),
      ElevatedButton.icon(
        onPressed: busy ? null : () => _generatePdf(l10n, isAiApproval: false),
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
          state.isExporting
              ? l10n.specialistReportGeneratingPdf
              : l10n.specialistReportGeneratePdf,
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
    ];
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(specialistReportDetailProvider(_args));
    final notifier = ref.read(specialistReportDetailProvider(_args).notifier);
    final detail = state.detail;

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
        child: DashboardEmptyCard(message: l10n.specialistReportNotFound),
      );
    } else {
      final sections = detail.sections;
      final contentDirection = _contentDirection(detail);

      body = SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SpecialistReportHeaderCard(
              detail: detail,
              isEditing: _isEditing,
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            SpecialistReportInformationCard(detail: detail),
            if (_isEditing && detail.isAiReport) ...[
              SizedBox(height: context.dashSpacing),
              SpecialistAiReportDraftEditPanel(
                fieldIds: specialistAiReportEditableFieldIds(),
                controllers: _draftControllers,
                textDirection: contentDirection,
                listHint: l10n.specialistReportEditListHint,
              ),
            ] else if (sections.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing),
              ...sections.map(
                (section) {
                  final displayTitle = section.fieldId != null
                      ? specialistAiReportSectionTitle(l10n, section.fieldId!)
                      : section.title;
                  return Padding(
                    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                    child: SpecialistReportSectionCard(
                      section: SpecialistReportSection(
                        title: displayTitle,
                        content: section.content,
                        fieldId: section.fieldId,
                        items: section.items,
                      ),
                      textDirection: detail.isAiReport ? contentDirection : null,
                    ),
                  );
                },
              ),
            ],
            ..._buildBottomActions(
              l10n: l10n,
              detail: detail,
              state: state,
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    if (widget.useAdminChrome) {
      return AdminPageScaffold(
        title: l10n.specialistReportDetailsTitle,
        showBackButton: true,
        showBottomNav: false,
        body: body,
      );
    }

    return SpecialistPageScaffold(
      title: l10n.specialistReportDetailsTitle,
      showBackButton: true,
      body: body,
    );
  }
}
