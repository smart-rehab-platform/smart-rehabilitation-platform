import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/models/admin_assignments_models.dart';
import '../../../dashboard/models/parent_dashboard_models.dart';
import '../../../dashboard/widgets/dashboard_components.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/parent_page_scaffold.dart';
import '../../data/complaints_repository.dart';
import '../../models/complaint_models.dart';
import '../../providers/parent_complaints_provider.dart';
import '../complaint_localization_utils.dart';

class ParentComplaintFormScreen extends ConsumerStatefulWidget {
  const ParentComplaintFormScreen({super.key});

  @override
  ConsumerState<ParentComplaintFormScreen> createState() =>
      _ParentComplaintFormScreenState();
}

class _ParentComplaintFormScreenState
    extends ConsumerState<ParentComplaintFormScreen> {
  final _descriptionController = TextEditingController();

  List<ParentChild> _children = const [];
  List<PatientSpecialistLink> _specialists = const [];
  ParentChild? _selectedChild;
  PatientSpecialistLink? _selectedSpecialist;
  ComplaintCategory? _selectedCategory;

  List<int>? _attachmentBytes;
  String? _attachmentFilename;
  bool _isUploadingAttachment = false;
  bool _isLoadingChildren = true;
  bool _isLoadingSpecialists = false;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _descriptionController.addListener(() => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadChildren());
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadChildren() async {
    setState(() {
      _isLoadingChildren = true;
      _loadError = null;
    });
    try {
      final children = await ref
          .read(parentComplaintsProvider.notifier)
          .loadChildren();
      if (!mounted) return;
      setState(() {
        _children = children;
        _selectedChild = children.length == 1 ? children.first : null;
        _isLoadingChildren = false;
      });
      if (_selectedChild != null) {
        await _loadSpecialists(_selectedChild!.id);
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoadingChildren = false;
        _loadError = error.toString();
      });
    }
  }

  Future<void> _loadSpecialists(String patientId) async {
    setState(() {
      _isLoadingSpecialists = true;
      _selectedSpecialist = null;
    });
    try {
      final specialists = await ref
          .read(parentComplaintsProvider.notifier)
          .loadSpecialists(patientId);
      if (!mounted) return;

      PatientSpecialistLink? selected;
      if (specialists.length == 1) {
        selected = specialists.first;
      } else if (specialists.isNotEmpty) {
        selected = specialists.firstWhere(
          (item) => item.isPrimary,
          orElse: () => specialists.first,
        );
      }

      setState(() {
        _specialists = specialists;
        _selectedSpecialist = selected;
        _isLoadingSpecialists = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoadingSpecialists = false;
        _specialists = const [];
      });
    }
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
        SnackBar(content: Text(l10n.complaintFormAttachmentPickFailed)),
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
    if (_selectedChild == null) return l10n.complaintFormSelectChild;
    if (_selectedSpecialist == null) {
      return l10n.complaintFormSelectSpecialist;
    }
    if (_selectedCategory == null) return l10n.complaintFormSelectCategory;
    final description = _descriptionController.text.trim();
    if (description.length < 20) return l10n.complaintFormDescriptionTooShort;
    if (description.length > 1000) return l10n.complaintFormDescriptionTooLong;
    return null;
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final validationError = _validate(l10n);
    if (validationError != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(validationError)));
      return;
    }

    final complaintsState = ref.read(parentComplaintsProvider);
    if (complaintsState.isSubmitting || _isUploadingAttachment) return;

    String? attachmentUrl;
    if (_attachmentBytes != null && _attachmentFilename != null) {
      setState(() => _isUploadingAttachment = true);
      try {
        attachmentUrl = await ref
            .read(complaintsRepositoryProvider)
            .uploadAttachment(
              bytes: _attachmentBytes!,
              filename: _attachmentFilename!,
            );
      } catch (error) {
        if (!mounted) return;
        setState(() => _isUploadingAttachment = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.complaintFormAttachmentUploadFailed)),
        );
        return;
      }
      if (!mounted) return;
      setState(() => _isUploadingAttachment = false);
    }

    final result = await ref
        .read(parentComplaintsProvider.notifier)
        .submitComplaint(
          CreateComplaintPayload(
            patientId: _selectedChild!.id,
            specialistId: _selectedSpecialist!.specialistId,
            category: _selectedCategory!,
            description: _descriptionController.text.trim(),
            attachmentUrl: attachmentUrl,
          ),
        );

    if (!mounted) return;

    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.complaintFormSubmittedSuccess)),
      );
      context.go(AppRoutes.parentComplaints);
      return;
    }

    final error = ref.read(parentComplaintsProvider).submitErrorMessage;
    if (error != null && error.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapParentComplaintSubmitError(l10n, error))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final complaintsState = ref.watch(parentComplaintsProvider);
    final theme = Theme.of(context);
    final descriptionLength = _descriptionController.text.trim().length;
    final isSubmitting =
        complaintsState.isSubmitting || _isUploadingAttachment;

    if (_isLoadingChildren) {
      return ParentPageScaffold(
        title: l10n.complaintFormTitle,
        showBackButton: true,
        body: const Center(child: DashboardLoadingCard()),
      );
    }

    if (_loadError != null) {
      return ParentPageScaffold(
        title: l10n.complaintFormTitle,
        showBackButton: true,
        body: DashboardErrorCard(
          message: l10n.complaintFormLoadFailed(_loadError!),
          onRetry: _loadChildren,
        ),
      );
    }

    return ParentPageScaffold(
      title: l10n.complaintFormTitle,
      showBackButton: true,
      body: ListView(
        padding: context.dashPadding,
        children: [
          Text(
            l10n.complaintFormIntro,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing),
          TextButton.icon(
            onPressed: () => context.push(AppRoutes.parentComplaints),
            icon: const Icon(Icons.history_rounded),
            label: Text(l10n.complaintHistoryTitle),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          _DropdownField<ParentChild>(
            label: l10n.complaintFormChildLabel,
            value: _selectedChild,
            items: _children,
            itemLabel: (child) => child.name,
            onChanged: (child) {
              setState(() => _selectedChild = child);
              if (child != null) {
                _loadSpecialists(child.id);
              }
            },
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          if (_isLoadingSpecialists)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: LinearProgressIndicator(),
            )
          else
            _DropdownField<PatientSpecialistLink>(
              label: l10n.complaintFormSpecialistLabel,
              value: _selectedSpecialist,
              items: _specialists,
              itemLabel: (item) => item.specialistName,
              onChanged: _specialists.isEmpty
                  ? null
                  : (value) => setState(() => _selectedSpecialist = value),
              emptyHint: l10n.complaintFormNoSpecialistAssigned,
            ),
          SizedBox(height: context.dashSpacing * 0.75),
          _DropdownField<ComplaintCategory>(
            label: l10n.complaintFormCategoryLabel,
            value: _selectedCategory,
            items: ComplaintCategory.values,
            itemLabel: (item) => localizedComplaintCategoryLabel(l10n, item),
            onChanged: (value) => setState(() => _selectedCategory = value),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: _descriptionController,
            minLines: 5,
            maxLines: 8,
            maxLength: 1000,
            decoration: InputDecoration(
              labelText: l10n.complaintFormDescriptionLabel,
              hintText: l10n.complaintFormDescriptionHint,
              alignLabelWithHint: true,
              counterText: l10n.complaintFormDescriptionCounter(descriptionLength),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          DashboardSurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.complaintFormAttachmentLabel,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.35),
                Text(
                  l10n.complaintFormAttachmentHint,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (_attachmentFilename != null) ...[
                  Row(
                    children: [
                      Icon(
                        _attachmentFilename!.toLowerCase().endsWith('.pdf')
                            ? Icons.picture_as_pdf_outlined
                            : Icons.image_outlined,
                        color: DashboardColors.brandCyan,
                      ),
                      SizedBox(width: context.dashSpacing * 0.4),
                      Expanded(child: Text(_attachmentFilename!)),
                      IconButton(
                        tooltip: l10n.complaintFormRemoveAttachment,
                        onPressed: _removeAttachment,
                        icon: const Icon(Icons.close_rounded),
                      ),
                    ],
                  ),
                ] else
                  OutlinedButton.icon(
                    onPressed: isSubmitting ? null : _pickAttachment,
                    icon: const Icon(Icons.attach_file_rounded),
                    label: Text(l10n.complaintFormAddAttachment),
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
              SizedBox(width: context.dashSpacing * 0.5),
              Expanded(
                child: BrandGradientButton(
                  onPressed: isSubmitting ? null : _submit,
                  label: isSubmitting
                      ? l10n.complaintFormSubmitting
                      : l10n.complaintFormSubmit,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
    this.emptyHint,
  });

  final String label;
  final T? value;
  final List<T> items;
  final String Function(T item) itemLabel;
  final ValueChanged<T?>? onChanged;
  final String? emptyHint;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty && emptyHint != null) {
      return InputDecorator(
        decoration: InputDecoration(labelText: label),
        child: Text(
          emptyHint!,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: DashboardColors.textSecondary,
          ),
        ),
      );
    }

    return DropdownButtonFormField<T>(
      value: value,
      decoration: InputDecoration(labelText: label),
      items: items
          .map(
            (item) => DropdownMenuItem<T>(
              value: item,
              child: Text(itemLabel(item)),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}
