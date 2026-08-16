import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/specialist_page_scaffold.dart';
import '../../data/support_requests_repository.dart';
import '../../models/support_request_models.dart';
import '../../providers/specialist_support_requests_provider.dart';
import '../support_request_localization_utils.dart';
import '../widgets/support_request_detail_widgets.dart';

class SpecialistSupportRequestDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistSupportRequestDetailsScreen({
    super.key,
    required this.requestId,
  });

  final String requestId;

  @override
  ConsumerState<SpecialistSupportRequestDetailsScreen> createState() =>
      _SpecialistSupportRequestDetailsScreenState();
}

class _SpecialistSupportRequestDetailsScreenState
    extends ConsumerState<SpecialistSupportRequestDetailsScreen> {
  final _replyController = TextEditingController();
  List<int>? _attachmentBytes;
  String? _attachmentFilename;
  bool _isUploadingAttachment = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistSupportRequestDetailProvider(widget.requestId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    await ref
        .read(specialistSupportRequestDetailProvider(widget.requestId).notifier)
        .refresh();
  }

  Future<void> _pickAttachment() async {
    final l10n = AppLocalizations.of(context)!;
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    final bytes = file.bytes;
    if (bytes == null || bytes.isEmpty) return;
    final validationError = validateSupportRequestAttachment(
      l10n: l10n,
      filename: file.name,
      byteLength: bytes.length,
    );
    if (validationError != null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(validationError)),
      );
      return;
    }
    setState(() {
      _attachmentBytes = bytes;
      _attachmentFilename = file.name;
    });
  }

  Future<void> _sendReply() async {
    final l10n = AppLocalizations.of(context)!;
    final detailState =
        ref.read(specialistSupportRequestDetailProvider(widget.requestId));
    if (detailState.isSubmitting || _isUploadingAttachment) return;

    final content = _replyController.text.trim();
    if (content.isEmpty && _attachmentBytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.supportRequestReplyRequired)),
      );
      return;
    }

    String? attachmentUrl;
    if (_attachmentBytes != null && _attachmentFilename != null) {
      setState(() => _isUploadingAttachment = true);
      try {
        attachmentUrl = await ref
            .read(supportRequestsRepositoryProvider)
            .uploadAttachment(
              bytes: _attachmentBytes!,
              filename: _attachmentFilename!,
            );
      } catch (_) {
        if (!mounted) return;
        setState(() => _isUploadingAttachment = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.supportRequestAttachmentUploadFailed)),
        );
        return;
      }
      if (!mounted) return;
      setState(() => _isUploadingAttachment = false);
    }

    final result = await ref
        .read(specialistSupportRequestDetailProvider(widget.requestId).notifier)
        .sendMessage(
          CreateSupportRequestMessagePayload(
            content: content,
            attachmentUrl: attachmentUrl,
          ),
        );

    if (!mounted) return;
    if (result != null) {
      _replyController.clear();
      setState(() {
        _attachmentBytes = null;
        _attachmentFilename = null;
      });
      return;
    }

    final error =
        ref.read(specialistSupportRequestDetailProvider(widget.requestId)).errorMessage;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapSupportRequestError(l10n, error))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(specialistSupportRequestDetailProvider(widget.requestId));
    final role = ref.watch(authProvider).user?.role ?? 'specialist';
    final isSubmitting = state.isSubmitting || _isUploadingAttachment;

    Widget body;
    if (state.isLoading && state.request == null) {
      body = Center(child: DashboardLoadingCard(message: l10n.supportRequestLoading));
    } else if (state.errorMessage != null && state.request == null) {
      body = DashboardErrorCard(
        message: mapSupportRequestError(l10n, state.errorMessage!),
        onRetry: _refresh,
      );
    } else {
      final request = state.request!;

      body = RefreshIndicator(
        color: DashboardColors.brandCyan,
        onRefresh: _refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            SupportRequestTicketHeader(request: request),
            SizedBox(height: context.dashSpacing * 0.85),
            SupportRequestConversationPanel(
              messages: request.messages,
              currentUserRole: role,
              footer: request.isResolved
                  ? SupportRequestResolvedNotice(resolvedAt: request.resolvedAt)
                  : SupportRequestReplySection(
                      controller: _replyController,
                      isSubmitting: isSubmitting,
                      attachmentFilename: _attachmentFilename,
                      onPickAttachment: _pickAttachment,
                      onClearAttachment: () => setState(() {
                        _attachmentBytes = null;
                        _attachmentFilename = null;
                      }),
                      onSend: _sendReply,
                    ),
            ),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.supportRequestDetailsTitle,
      showBackButton: true,
      body: body,
    );
  }
}
