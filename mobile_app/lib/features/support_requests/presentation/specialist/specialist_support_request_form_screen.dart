import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/dashboard_components.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/specialist_page_scaffold.dart';
import '../../data/support_requests_repository.dart';
import '../../models/support_request_models.dart';
import '../../providers/specialist_support_requests_provider.dart';
import '../support_request_localization_utils.dart';

class SpecialistSupportRequestFormScreen extends ConsumerStatefulWidget {
  const SpecialistSupportRequestFormScreen({super.key});

  @override
  ConsumerState<SpecialistSupportRequestFormScreen> createState() =>
      _SpecialistSupportRequestFormScreenState();
}

class _SpecialistSupportRequestFormScreenState
    extends ConsumerState<SpecialistSupportRequestFormScreen> {
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();

  SupportRequestCategory? _selectedCategory;
  List<int>? _attachmentBytes;
  String? _attachmentFilename;
  bool _isUploadingAttachment = false;

  @override
  void initState() {
    super.initState();
    _subjectController.addListener(() => setState(() {}));
    _descriptionController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
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
    if (bytes == null || bytes.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.supportRequestAttachmentPickFailed)),
      );
      return;
    }
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

  void _removeAttachment() {
    setState(() {
      _attachmentBytes = null;
      _attachmentFilename = null;
    });
  }

  String? _validate(AppLocalizations l10n) {
    if (_selectedCategory == null) {
      return l10n.supportRequestSelectCategory;
    }
    final subject = _subjectController.text.trim();
    if (subject.length < supportRequestSubjectMinLength) {
      return l10n.supportRequestSubjectTooShort;
    }
    if (subject.length > supportRequestSubjectMaxLength) {
      return l10n.supportRequestSubjectTooLong;
    }
    final description = _descriptionController.text.trim();
    if (description.length < supportRequestDescriptionMinLength) {
      return l10n.supportRequestDescriptionTooShort;
    }
    if (description.length > supportRequestDescriptionMaxLength) {
      return l10n.supportRequestDescriptionTooLong;
    }
    return null;
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final validationError = _validate(l10n);
    if (validationError != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(validationError)),
      );
      return;
    }

    final formState = ref.read(specialistSupportRequestsProvider);
    if (formState.isSubmitting || _isUploadingAttachment) return;

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
        .read(specialistSupportRequestsProvider.notifier)
        .createRequest(
          CreateSupportRequestPayload(
            category: _selectedCategory!,
            subject: _subjectController.text.trim(),
            description: _descriptionController.text.trim(),
            attachmentUrl: attachmentUrl,
          ),
        );

    if (!mounted) return;
    if (result != null) {
      context.go(AppRoutes.specialistSupportRequestDetail(result.id));
      return;
    }

    final error = ref.read(specialistSupportRequestsProvider).submitErrorMessage;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapSupportRequestError(l10n, error))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final isSubmitting =
        ref.watch(specialistSupportRequestsProvider).isSubmitting ||
        _isUploadingAttachment;
    final descriptionLength = _descriptionController.text.trim().length;

    return SpecialistPageScaffold(
      title: l10n.supportRequestNewRequest,
      showBackButton: true,
      body: ListView(
        padding: context.dashPadding,
        children: [
          DashboardSurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DropdownButtonFormField<SupportRequestCategory>(
                  value: _selectedCategory,
                  decoration: InputDecoration(
                    labelText: l10n.supportRequestCategoryLabel,
                  ),
                  items: SupportRequestCategory.values
                      .map(
                        (category) => DropdownMenuItem(
                          value: category,
                          child: Text(
                            localizedSupportRequestCategoryLabel(l10n, category),
                          ),
                        ),
                      )
                      .toList(growable: false),
                  onChanged: isSubmitting
                      ? null
                      : (value) => setState(() => _selectedCategory = value),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                TextField(
                  controller: _subjectController,
                  maxLength: supportRequestSubjectMaxLength,
                  enabled: !isSubmitting,
                  decoration: InputDecoration(
                    labelText: l10n.supportRequestSubjectLabel,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                TextField(
                  controller: _descriptionController,
                  maxLines: 6,
                  maxLength: supportRequestDescriptionMaxLength,
                  enabled: !isSubmitting,
                  decoration: InputDecoration(
                    labelText: l10n.supportRequestDescriptionLabel,
                    hintText: l10n.supportRequestDescriptionHint,
                    helperText: l10n.supportRequestDescriptionCounter(descriptionLength),
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                Text(
                  l10n.supportRequestAttachmentLabel,
                  style: theme.textTheme.labelLarge,
                ),
                SizedBox(height: context.dashSpacing * 0.35),
                if (_attachmentFilename != null)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(_attachmentFilename!),
                    trailing: IconButton(
                      onPressed: isSubmitting ? null : _removeAttachment,
                      icon: const Icon(Icons.close_rounded),
                    ),
                  )
                else
                  OutlinedButton.icon(
                    onPressed: isSubmitting ? null : _pickAttachment,
                    icon: const Icon(Icons.attach_file_rounded),
                    label: Text(l10n.supportRequestAddAttachment),
                  ),
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: isSubmitting ? null : () => context.pop(),
                  child: Text(l10n.commonCancel),
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(
                child: BrandGradientButton(
                  onPressed: isSubmitting ? null : _submit,
                  icon: isSubmitting ? null : Icons.send_rounded,
                  label: isSubmitting
                      ? l10n.supportRequestSubmitting
                      : l10n.supportRequestSubmitRequest,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
