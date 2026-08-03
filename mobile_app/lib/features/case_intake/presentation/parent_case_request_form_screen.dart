import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../dashboard/models/session_requests_models.dart';
import '../../dashboard/widgets/dashboard_components.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_profile_avatar.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../dashboard/widgets/parent_page_scaffold.dart';
import '../../dashboard/widgets/profile_image_picker.dart';
import '../models/case_category_model.dart';
import '../models/case_intake_request_model.dart';
import '../providers/case_categories_provider.dart';
import '../providers/parent_case_intake_provider.dart';
import 'parent_case_intake_localization_utils.dart';
import '../widgets/case_request_step_indicator.dart';

class ParentCaseRequestFormScreen extends ConsumerStatefulWidget {
  const ParentCaseRequestFormScreen({super.key, this.requestId});

  final String? requestId;

  bool get isEditMode => requestId != null && requestId!.isNotEmpty;

  @override
  ConsumerState<ParentCaseRequestFormScreen> createState() =>
      _ParentCaseRequestFormScreenState();
}

class _ParentCaseRequestFormScreenState
    extends ConsumerState<ParentCaseRequestFormScreen> {
  static const _childNameMax = 150;
  static const _textMax = 5000;
  static const _totalSteps = 6;

  final _childNameController = TextEditingController();
  final _caseDescriptionController = TextEditingController();
  final _observedDifficultiesController = TextEditingController();
  final _previousDiagnosisController = TextEditingController();
  final _currentTreatmentController = TextEditingController();

  DateTime? _dateOfBirth;
  CaseIntakeGender? _gender;
  String? _selectedCategoryId;
  Uint8List? _pendingChildImageBytes;
  String? _pendingChildImageFilename;
  String? _existingChildImageUrl;
  bool _clearExistingChildImage = false;
  bool _isUploadingChildImage = false;
  bool _hasPreviousDiagnosis = false;
  bool _isCurrentlyReceivingTreatment = false;
  PreferredTimePeriod? _preferredContactPeriod;

  int _currentStep = 0;
  bool _isDirty = false;
  bool _isLoadingExisting = false;
  String? _loadError;
  String? _stepError;

  @override
  void initState() {
    super.initState();
    _attachDirtyListeners();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(caseCategoriesProvider.notifier).loadCategories();
      if (widget.isEditMode) {
        await _loadExistingRequest();
      }
    });
  }

  void _attachDirtyListeners() {
    for (final controller in [
      _childNameController,
      _caseDescriptionController,
      _observedDifficultiesController,
      _previousDiagnosisController,
      _currentTreatmentController,
    ]) {
      controller.addListener(_markDirty);
    }
  }

  void _markDirty() {
    if (!_isDirty) {
      setState(() => _isDirty = true);
    }
  }

  Future<void> _loadExistingRequest() async {
    setState(() {
      _isLoadingExisting = true;
      _loadError = null;
    });

    final request = await ref
        .read(parentCaseIntakeProvider.notifier)
        .loadRequestDetails(widget.requestId!);

    if (!mounted) {
      return;
    }

    if (request == null) {
      setState(() {
        _isLoadingExisting = false;
        _loadError =
            ref.read(parentCaseIntakeProvider).errorMessage ??
            'Failed to load request for editing.';
      });
      return;
    }

    if (!request.canEdit) {
      setState(() {
        _isLoadingExisting = false;
        _loadError = 'Only pending requests can be edited.';
      });
      return;
    }

    _childNameController.text = request.childName;
    _caseDescriptionController.text = request.caseDescription ?? '';
    _observedDifficultiesController.text = request.observedDifficulties ?? '';
    _previousDiagnosisController.text = request.previousDiagnosisDetails ?? '';
    _currentTreatmentController.text = request.currentTreatmentDetails ?? '';

    setState(() {
      _dateOfBirth = request.dateOfBirth;
      _gender = CaseIntakeGender.fromApi(request.gender);
      _existingChildImageUrl = request.childImageUrl;
      _pendingChildImageBytes = null;
      _pendingChildImageFilename = null;
      _clearExistingChildImage = false;
      _selectedCategoryId = request.categoryId ?? request.category?.id;
      _hasPreviousDiagnosis = request.hasPreviousDiagnosis;
      _isCurrentlyReceivingTreatment = request.isCurrentlyReceivingTreatment;
      _preferredContactPeriod = request.preferredContactPeriod;
      _isLoadingExisting = false;
      _isDirty = false;
    });
  }

  @override
  void dispose() {
    _childNameController.dispose();
    _caseDescriptionController.dispose();
    _observedDifficultiesController.dispose();
    _previousDiagnosisController.dispose();
    _currentTreatmentController.dispose();
    super.dispose();
  }

  Future<bool> _confirmDiscard() async {
    if (!_isDirty) {
      return true;
    }

    final shouldLeave = await showDialog<bool>(
      context: context,
      builder: (context) {
        final l10n = AppLocalizations.of(context)!;
        return AlertDialog(
          title: Text(l10n.parentCaseRequestFormDiscardTitle),
          content: Text(l10n.parentCaseRequestFormDiscardMessage),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(l10n.parentCaseRequestFormStay),
            ),
            FilledButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: Text(l10n.parentCaseRequestFormLeave),
            ),
          ],
        );
      },
    );

    return shouldLeave ?? false;
  }

  Future<void> _handleBack() async {
    if (_currentStep > 0) {
      setState(() {
        _currentStep -= 1;
        _stepError = null;
      });
      return;
    }

    final canLeave = await _confirmDiscard();
    if (canLeave && mounted) {
      context.pop();
    }
  }

  String? _validateCurrentStep() {
    switch (_currentStep) {
      case 0:
        final name = _childNameController.text.trim();
        if (name.isEmpty) {
          return 'Child name is required.';
        }
        if (name.length > _childNameMax) {
          return 'Child name must not exceed $_childNameMax characters.';
        }
        if (_dateOfBirth == null) {
          return 'Date of birth is required.';
        }
        final today = DateTime.now();
        final dob = _dateOfBirth!;
        if (dob.isAfter(DateTime(today.year, today.month, today.day))) {
          return 'Date of birth cannot be in the future.';
        }
        if (_gender == null) {
          return 'Gender is required.';
        }
        return null;
      case 1:
        if (_selectedCategoryId == null || _selectedCategoryId!.isEmpty) {
          return 'Please select a case category.';
        }
        return null;
      case 2:
        final description = _caseDescriptionController.text.trim();
        if (description.isEmpty) {
          return 'Case description is required.';
        }
        if (description.length > _textMax) {
          return 'Case description must not exceed $_textMax characters.';
        }
        final observed = _observedDifficultiesController.text.trim();
        if (observed.length > _textMax) {
          return 'Observed difficulties must not exceed $_textMax characters.';
        }
        return null;
      case 3:
        if (_hasPreviousDiagnosis) {
          final details = _previousDiagnosisController.text.trim();
          if (details.length > _textMax) {
            return 'Previous diagnosis details must not exceed $_textMax characters.';
          }
        }
        if (_isCurrentlyReceivingTreatment) {
          final details = _currentTreatmentController.text.trim();
          if (details.length > _textMax) {
            return 'Current treatment details must not exceed $_textMax characters.';
          }
        }
        return null;
      case 4:
        if (_preferredContactPeriod == null) {
          return 'Please choose a preferred contact period.';
        }
        return null;
      default:
        return null;
    }
  }

  void _goNext() {
    final error = _validateCurrentStep();
    if (error != null) {
      final l10n = AppLocalizations.of(context)!;
      setState(
        () => _stepError = mapParentCaseIntakeValidationMessage(
          l10n,
          error,
          childNameMax: _childNameMax,
          textMax: _textMax,
        ),
      );
      return;
    }

    setState(() {
      _stepError = null;
      _currentStep += 1;
    });
  }

  CaseIntakeRequestInput _buildInput({
    String? childImageUrl,
    bool clearChildImageUrl = false,
  }) {
    return CaseIntakeRequestInput(
      childName: _childNameController.text.trim(),
      dateOfBirth: DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
      gender: _gender?.apiValue,
      categoryId: _selectedCategoryId!,
      caseDescription: _caseDescriptionController.text.trim(),
      observedDifficulties: _observedDifficultiesController.text.trim().isEmpty
          ? null
          : _observedDifficultiesController.text.trim(),
      hasPreviousDiagnosis: _hasPreviousDiagnosis,
      previousDiagnosisDetails: _hasPreviousDiagnosis
          ? _previousDiagnosisController.text.trim()
          : null,
      isCurrentlyReceivingTreatment: _isCurrentlyReceivingTreatment,
      currentTreatmentDetails: _isCurrentlyReceivingTreatment
          ? _currentTreatmentController.text.trim()
          : null,
      preferredContactPeriod: _preferredContactPeriod!,
      childImageUrl: childImageUrl,
      clearChildImageUrl: clearChildImageUrl,
    );
  }

  Future<void> _submit() async {
    final error = _validateCurrentStep();
    if (error != null) {
      final l10n = AppLocalizations.of(context)!;
      setState(
        () => _stepError = mapParentCaseIntakeValidationMessage(
          l10n,
          error,
          childNameMax: _childNameMax,
          textMax: _textMax,
        ),
      );
      return;
    }

    final l10n = AppLocalizations.of(context)!;
    final notifier = ref.read(parentCaseIntakeProvider.notifier);
    String? childImageUrl;
    var clearChildImageUrl = false;

    if (_pendingChildImageBytes != null && _pendingChildImageFilename != null) {
      setState(() => _isUploadingChildImage = true);
      childImageUrl = await notifier.uploadChildImage(
        bytes: _pendingChildImageBytes!,
        filename: _pendingChildImageFilename!,
      );
      if (!mounted) {
        return;
      }
      setState(() => _isUploadingChildImage = false);
      if (childImageUrl == null || childImageUrl.isEmpty) {
        final message = ref.read(parentCaseIntakeProvider).errorMessage;
        if (message != null && message.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(mapParentCaseIntakeProviderError(l10n, message)),
            ),
          );
        }
        return;
      }
    } else if (_clearExistingChildImage) {
      clearChildImageUrl = true;
    } else if (_existingChildImageUrl != null &&
        _existingChildImageUrl!.trim().isNotEmpty) {
      childImageUrl = _existingChildImageUrl;
    }

    final input = _buildInput(
      childImageUrl: childImageUrl,
      clearChildImageUrl: clearChildImageUrl,
    );
    final result = widget.isEditMode
        ? await notifier.updateRequest(widget.requestId!, input)
        : await notifier.createRequest(input);

    if (!mounted) {
      return;
    }

    if (result != null) {
      setState(() => _isDirty = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.isEditMode
                ? l10n.parentCaseRequestFormUpdatedSuccess
                : l10n.parentCaseRequestFormSubmittedSuccess,
          ),
        ),
      );
      context.pop();
      if (!widget.isEditMode) {
        context.push(AppRoutes.parentCaseRequestDetail(result.id));
      }
    } else {
      final message = ref.read(parentCaseIntakeProvider).errorMessage;
      if (message != null && message.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(mapParentCaseIntakeProviderError(l10n, message)),
          ),
        );
      }
    }
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final initial = _dateOfBirth ?? DateTime(now.year - 6, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1990),
      lastDate: now,
    );
    if (picked != null) {
      setState(() {
        _dateOfBirth = picked;
        _isDirty = true;
      });
    }
  }

  Future<void> _pickChildPhoto() async {
    if (_isUploadingChildImage) {
      return;
    }

    final picker = ProfileImagePicker();
    try {
      final result = await picker.showSourceSheet(context);
      if (result == null || !mounted) {
        return;
      }
      setState(() {
        _pendingChildImageBytes = result.bytes;
        _pendingChildImageFilename = result.filename;
        _clearExistingChildImage = false;
        _isDirty = true;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            AppLocalizations.of(
              context,
            )!.parentCaseRequestFormImageSelectFailed('$error'),
          ),
        ),
      );
    }
  }

  void _removeChildPhoto() {
    setState(() {
      _pendingChildImageBytes = null;
      _pendingChildImageFilename = null;
      if (_existingChildImageUrl != null &&
          _existingChildImageUrl!.trim().isNotEmpty) {
        _clearExistingChildImage = true;
      }
      _isDirty = true;
    });
  }

  bool get _hasChildPhotoPreview =>
      _pendingChildImageBytes != null ||
      (!_clearExistingChildImage &&
          _existingChildImageUrl != null &&
          _existingChildImageUrl!.trim().isNotEmpty);

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final categoriesState = ref.watch(caseCategoriesProvider);
    final intakeState = ref.watch(parentCaseIntakeProvider);
    final isSubmitting =
        intakeState.isSubmitting ||
        intakeState.isUpdating ||
        _isUploadingChildImage;
    final theme = Theme.of(context);
    final formTitle = widget.isEditMode
        ? l10n.parentCaseRequestFormEditTitle
        : l10n.parentCaseRequestFormNewTitle;

    if (_isLoadingExisting) {
      return ParentPageScaffold(
        title: formTitle,
        showBackButton: true,
        body: const Center(child: DashboardLoadingCard()),
      );
    }

    if (_loadError != null) {
      return ParentPageScaffold(
        title: formTitle,
        showBackButton: true,
        body: DashboardErrorCard(
          message: mapParentCaseIntakeFormLoadError(l10n, _loadError!),
          onRetry: widget.isEditMode
              ? _loadExistingRequest
              : () => context.pop(),
        ),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) {
          return;
        }
        await _handleBack();
      },
      child: ParentPageScaffold(
        title: formTitle,
        showBackButton: true,
        body: Column(
          children: [
            Expanded(
              child: ListView(
                padding: context.dashPadding,
                children: [
                  if (_currentStep == 0) ...[
                    Text(
                      l10n.parentDashboardCaseIntakeTitle,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.35),
                    Text(
                      l10n.parentDashboardCaseIntakeDescription,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing),
                  ],
                  CaseRequestStepIndicator(
                    currentStep: _currentStep,
                    totalSteps: _totalSteps,
                    accentColor: DashboardColors.brandCyan,
                  ),
                  SizedBox(height: context.dashSpacing),
                  if (_stepError != null) ...[
                    DashboardErrorCard(
                      message: _stepError!,
                      onRetry: () => setState(() => _stepError = null),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  _buildStepContent(categoriesState.categories),
                ],
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: context.dashPadding,
                child: Row(
                  children: [
                    if (_currentStep > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: isSubmitting ? null : _handleBack,
                          style: brandOutlinedButtonStyle(),
                          child: Text(l10n.commonBack),
                        ),
                      ),
                    if (_currentStep > 0)
                      SizedBox(width: context.dashSpacing * 0.5),
                    Expanded(
                      child: BrandGradientButton(
                        onPressed: isSubmitting
                            ? null
                            : _currentStep == _totalSteps - 1
                            ? _submit
                            : _goNext,
                        isLoading: isSubmitting,
                        label: _currentStep == _totalSteps - 1
                            ? (isSubmitting
                                  ? l10n.parentCaseRequestFormSubmitting
                                  : widget.isEditMode
                                  ? l10n.parentProfileSaveChanges
                                  : l10n.parentCaseRequestFormSubmitRequest)
                            : l10n.commonNext,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent(List<CaseCategory> categories) {
    switch (_currentStep) {
      case 0:
        return _ChildInfoStep(
          childNameController: _childNameController,
          dateOfBirth: _dateOfBirth,
          gender: _gender,
          childName: _childNameController.text,
          existingChildImageUrl: _clearExistingChildImage
              ? null
              : _existingChildImageUrl,
          previewBytes: _pendingChildImageBytes,
          isBusy: _isUploadingChildImage,
          onPickPhoto: _pickChildPhoto,
          onRemovePhoto: _removeChildPhoto,
          onPickDob: _pickDateOfBirth,
          onGenderChanged: (value) => setState(() {
            _gender = value;
            _isDirty = true;
          }),
          childNameMax: _childNameMax,
        );
      case 1:
        return _CategoryStep(
          categories: categories,
          isLoading: ref.watch(caseCategoriesProvider).isLoading,
          errorMessage: ref.watch(caseCategoriesProvider).errorMessage,
          selectedCategoryId: _selectedCategoryId,
          onRetry: () => ref
              .read(caseCategoriesProvider.notifier)
              .loadCategories(force: true),
          onSelected: (id) => setState(() {
            _selectedCategoryId = id;
            _isDirty = true;
          }),
        );
      case 2:
        return _DescriptionStep(
          caseDescriptionController: _caseDescriptionController,
          observedDifficultiesController: _observedDifficultiesController,
          textMax: _textMax,
        );
      case 3:
        return _HistoryStep(
          hasPreviousDiagnosis: _hasPreviousDiagnosis,
          isCurrentlyReceivingTreatment: _isCurrentlyReceivingTreatment,
          previousDiagnosisController: _previousDiagnosisController,
          currentTreatmentController: _currentTreatmentController,
          textMax: _textMax,
          onPreviousDiagnosisChanged: (value) => setState(() {
            _hasPreviousDiagnosis = value;
            _isDirty = true;
          }),
          onCurrentTreatmentChanged: (value) => setState(() {
            _isCurrentlyReceivingTreatment = value;
            _isDirty = true;
          }),
        );
      case 4:
        return _ContactStep(
          selected: _preferredContactPeriod,
          onSelected: (value) => setState(() {
            _preferredContactPeriod = value;
            _isDirty = true;
          }),
        );
      case 5:
        return _ReviewStep(
          childName: _childNameController.text.trim(),
          dateOfBirth: _dateOfBirth,
          gender: _gender,
          childImageUrl: _clearExistingChildImage
              ? null
              : _existingChildImageUrl,
          previewBytes: _pendingChildImageBytes,
          hasChildPhoto: _hasChildPhotoPreview,
          category: categories.firstWhere(
            (item) => item.id == _selectedCategoryId,
            orElse: () => CaseCategory(
              id: '',
              name: AppLocalizations.of(
                context,
              )!.parentCaseRequestFormNotSelected,
            ),
          ),
          caseDescription: _caseDescriptionController.text.trim(),
          observedDifficulties: _observedDifficultiesController.text.trim(),
          hasPreviousDiagnosis: _hasPreviousDiagnosis,
          previousDiagnosisDetails: _previousDiagnosisController.text.trim(),
          isCurrentlyReceivingTreatment: _isCurrentlyReceivingTreatment,
          currentTreatmentDetails: _currentTreatmentController.text.trim(),
          preferredContactPeriod: _preferredContactPeriod,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

class _ChildInfoStep extends StatelessWidget {
  const _ChildInfoStep({
    required this.childNameController,
    required this.dateOfBirth,
    required this.gender,
    required this.childName,
    required this.existingChildImageUrl,
    required this.previewBytes,
    required this.isBusy,
    required this.onPickPhoto,
    required this.onRemovePhoto,
    required this.onPickDob,
    required this.onGenderChanged,
    required this.childNameMax,
  });

  final TextEditingController childNameController;
  final DateTime? dateOfBirth;
  final CaseIntakeGender? gender;
  final String childName;
  final String? existingChildImageUrl;
  final Uint8List? previewBytes;
  final bool isBusy;
  final VoidCallback onPickPhoto;
  final VoidCallback onRemovePhoto;
  final VoidCallback onPickDob;
  final ValueChanged<CaseIntakeGender?> onGenderChanged;
  final int childNameMax;

  bool get _hasPhoto =>
      previewBytes != null ||
      (existingChildImageUrl != null &&
          existingChildImageUrl!.trim().isNotEmpty);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final dobLabel = dateOfBirth != null
        ? DateFormat('MMM d, yyyy').format(dateOfBirth!)
        : l10n.adminPatientsSelectDateOfBirth;
    final initials = dashboardInitials(
      childName.trim().isEmpty ? l10n.entityChild : childName.trim(),
      fallback: 'CH',
    );

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.parentCaseRequestFormChildInfoSection,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Center(
            child: Column(
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    DashboardProfileAvatar(
                      initials: initials,
                      imageUrl: previewBytes == null
                          ? existingChildImageUrl
                          : null,
                      previewBytes: previewBytes,
                      radius: 40,
                      isLoading: isBusy,
                      onTap: isBusy ? null : onPickPhoto,
                    ),
                    PositionedDirectional(
                      end: 0,
                      bottom: 0,
                      child: Material(
                        color: DashboardColors.brandCyan,
                        shape: const CircleBorder(),
                        elevation: 2,
                        child: InkWell(
                          onTap: isBusy ? null : onPickPhoto,
                          customBorder: const CircleBorder(),
                          child: const Padding(
                            padding: EdgeInsets.all(8),
                            child: Icon(
                              Icons.camera_alt_rounded,
                              size: 18,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.35),
                Text(
                  _hasPhoto
                      ? l10n.parentCaseRequestFormChangeChildPhoto
                      : l10n.parentCaseRequestFormAddChildPhoto,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.brandCyan,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  l10n.commonOptional,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textMuted,
                  ),
                ),
                if (_hasPhoto) ...[
                  SizedBox(height: context.dashSpacing * 0.25),
                  TextButton(
                    onPressed: isBusy ? null : onRemovePhoto,
                    child: Text(
                      l10n.parentCaseRequestFormRemovePhoto,
                      style: theme.textTheme.labelLarge?.copyWith(
                        color: DashboardColors.brandCyan,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: childNameController,
            maxLength: childNameMax,
            decoration: InputDecoration(
              labelText: l10n.parentCaseRequestFormChildName,
              border: const OutlineInputBorder(),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          OutlinedButton.icon(
            onPressed: onPickDob,
            style: brandOutlinedButtonStyle(),
            icon: const Icon(Icons.calendar_today_outlined),
            label: Text(dobLabel),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            l10n.fieldGender,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Row(
            children: [
              for (
                var index = 0;
                index < CaseIntakeGender.values.length;
                index++
              ) ...[
                if (index > 0) SizedBox(width: context.dashSpacing * 0.35),
                Expanded(
                  child: ChoiceChip(
                    label: Center(
                      child: Text(
                        localizedCaseIntakeGender(
                          l10n,
                          CaseIntakeGender.values[index],
                        ),
                      ),
                    ),
                    selected: gender == CaseIntakeGender.values[index],
                    onSelected: (_) =>
                        onGenderChanged(CaseIntakeGender.values[index]),
                    selectedColor: DashboardColors.brandSoft,
                    checkmarkColor: DashboardColors.brandCyan,
                    side: BorderSide(
                      color: gender == CaseIntakeGender.values[index]
                          ? DashboardColors.brandCyan
                          : DashboardColors.border,
                    ),
                    labelStyle: TextStyle(
                      color: gender == CaseIntakeGender.values[index]
                          ? DashboardColors.brandCyan
                          : DashboardColors.textPrimary,
                      fontWeight: gender == CaseIntakeGender.values[index]
                          ? FontWeight.w700
                          : FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _CategoryStep extends StatelessWidget {
  const _CategoryStep({
    required this.categories,
    required this.isLoading,
    required this.errorMessage,
    required this.selectedCategoryId,
    required this.onRetry,
    required this.onSelected,
  });

  final List<CaseCategory> categories;
  final bool isLoading;
  final String? errorMessage;
  final String? selectedCategoryId;
  final VoidCallback onRetry;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    if (isLoading && categories.isEmpty) {
      return const DashboardLoadingCard();
    }

    if (errorMessage != null && categories.isEmpty) {
      return DashboardErrorCard(
        message: mapParentCaseIntakeProviderError(l10n, errorMessage!),
        onRetry: onRetry,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          l10n.parentCaseRequestFormCategoryGuidance,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: DashboardColors.textSecondary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        Text(
          l10n.parentDashboardCaseIntakeDisclaimer,
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textMuted,
            fontStyle: FontStyle.italic,
          ),
        ),
        SizedBox(height: context.dashSpacing),
        ...categories.map((category) {
          final isSelected = category.id == selectedCategoryId;
          return Padding(
            padding: EdgeInsets.only(bottom: context.dashSpacing * 0.45),
            child: DashboardSurfaceCard(
              onTap: () => onSelected(category.id),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    isSelected
                        ? Icons.radio_button_checked_rounded
                        : Icons.radio_button_off_rounded,
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.textMuted,
                  ),
                  SizedBox(width: context.dashSpacing * 0.45),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          category.name,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (category.description?.trim().isNotEmpty ==
                            true) ...[
                          SizedBox(height: context.dashSpacing * 0.2),
                          Text(
                            category.description!.trim(),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: DashboardColors.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

class _DescriptionStep extends StatelessWidget {
  const _DescriptionStep({
    required this.caseDescriptionController,
    required this.observedDifficultiesController,
    required this.textMax,
  });

  final TextEditingController caseDescriptionController;
  final TextEditingController observedDifficultiesController;
  final int textMax;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.parentCaseRequestFormCaseDescriptionSection,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: caseDescriptionController,
            maxLines: 5,
            maxLength: textMax,
            decoration: InputDecoration(
              labelText: l10n.parentCaseRequestFormCaseDescriptionLabel,
              helperText: l10n.parentCaseRequestFormCaseDescriptionHelper(
                textMax,
              ),
              border: const OutlineInputBorder(),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: observedDifficultiesController,
            maxLines: 4,
            maxLength: textMax,
            decoration: InputDecoration(
              labelText: l10n.parentCaseRequestFormObservedDifficultiesLabel,
              helperText: l10n.parentCaseRequestFormObservedDifficultiesHelper(
                textMax,
              ),
              border: const OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryStep extends StatelessWidget {
  const _HistoryStep({
    required this.hasPreviousDiagnosis,
    required this.isCurrentlyReceivingTreatment,
    required this.previousDiagnosisController,
    required this.currentTreatmentController,
    required this.textMax,
    required this.onPreviousDiagnosisChanged,
    required this.onCurrentTreatmentChanged,
  });

  final bool hasPreviousDiagnosis;
  final bool isCurrentlyReceivingTreatment;
  final TextEditingController previousDiagnosisController;
  final TextEditingController currentTreatmentController;
  final int textMax;
  final ValueChanged<bool> onPreviousDiagnosisChanged;
  final ValueChanged<bool> onCurrentTreatmentChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(l10n.parentCaseRequestFormHasPreviousDiagnosis),
            value: hasPreviousDiagnosis,
            onChanged: onPreviousDiagnosisChanged,
            activeThumbColor: DashboardColors.brandCyan,
            activeTrackColor: DashboardColors.brandCyan.withValues(alpha: 0.35),
          ),
          if (hasPreviousDiagnosis)
            TextField(
              controller: previousDiagnosisController,
              maxLines: 3,
              maxLength: textMax,
              decoration: InputDecoration(
                labelText: l10n.parentCaseRequestFormPreviousDiagnosisDetails,
                border: const OutlineInputBorder(),
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.5),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(l10n.parentCaseRequestFormCurrentlyReceivingTreatment),
            value: isCurrentlyReceivingTreatment,
            onChanged: onCurrentTreatmentChanged,
            activeThumbColor: DashboardColors.brandCyan,
            activeTrackColor: DashboardColors.brandCyan.withValues(alpha: 0.35),
          ),
          if (isCurrentlyReceivingTreatment)
            TextField(
              controller: currentTreatmentController,
              maxLines: 3,
              maxLength: textMax,
              decoration: InputDecoration(
                labelText: l10n.parentCaseRequestFormCurrentTreatmentDetails,
                border: const OutlineInputBorder(),
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.parentCaseRequestFormHistoryHelper,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _ContactStep extends StatelessWidget {
  const _ContactStep({required this.selected, required this.onSelected});

  final PreferredTimePeriod? selected;
  final ValueChanged<PreferredTimePeriod> onSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.parentCaseRequestFormPreferredContactPeriod,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: PreferredTimePeriod.values.map((period) {
              return ChoiceChip(
                label: Text(
                  localizedCaseIntakePreferredContactPeriod(l10n, period),
                ),
                selected: selected == period,
                onSelected: (_) => onSelected(period),
                selectedColor: DashboardColors.brandSoft,
                checkmarkColor: DashboardColors.brandCyan,
                side: BorderSide(
                  color: selected == period
                      ? DashboardColors.brandCyan
                      : DashboardColors.border,
                ),
                labelStyle: TextStyle(
                  color: selected == period
                      ? DashboardColors.brandCyan
                      : DashboardColors.textPrimary,
                  fontWeight: selected == period
                      ? FontWeight.w700
                      : FontWeight.w500,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _ReviewStep extends StatelessWidget {
  const _ReviewStep({
    required this.childName,
    required this.dateOfBirth,
    required this.gender,
    required this.hasChildPhoto,
    this.childImageUrl,
    this.previewBytes,
    required this.category,
    required this.caseDescription,
    required this.observedDifficulties,
    required this.hasPreviousDiagnosis,
    required this.previousDiagnosisDetails,
    required this.isCurrentlyReceivingTreatment,
    required this.currentTreatmentDetails,
    required this.preferredContactPeriod,
  });

  final String childName;
  final DateTime? dateOfBirth;
  final CaseIntakeGender? gender;
  final bool hasChildPhoto;
  final String? childImageUrl;
  final Uint8List? previewBytes;
  final CaseCategory category;
  final String caseDescription;
  final String observedDifficulties;
  final bool hasPreviousDiagnosis;
  final String previousDiagnosisDetails;
  final bool isCurrentlyReceivingTreatment;
  final String currentTreatmentDetails;
  final PreferredTimePeriod? preferredContactPeriod;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final dobLabel = dateOfBirth != null
        ? DateFormat('MMM d, yyyy').format(dateOfBirth!)
        : l10n.parentCaseRequestFormNotSet;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.parentCaseRequestFormReviewTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          if (hasChildPhoto) ...[
            Center(
              child: DashboardProfileAvatar(
                initials: dashboardInitials(childName, fallback: 'CH'),
                imageUrl: previewBytes == null ? childImageUrl : null,
                previewBytes: previewBytes,
                radius: 32,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
          ],
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewChildName,
            value: childName,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewDob,
            value: dobLabel,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewGender,
            value: localizedCaseIntakeGender(l10n, gender),
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewCategory,
            value: category.name,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewCaseDescription,
            value: caseDescription,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewObservedDifficulties,
            value: observedDifficulties.isEmpty
                ? l10n.parentCaseRequestFormNoneProvided
                : observedDifficulties,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewPreviousDiagnosis,
            value: hasPreviousDiagnosis
                ? (previousDiagnosisDetails.isEmpty
                      ? l10n.commonYes
                      : previousDiagnosisDetails)
                : l10n.commonNo,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewCurrentTreatment,
            value: isCurrentlyReceivingTreatment
                ? (currentTreatmentDetails.isEmpty
                      ? l10n.commonYes
                      : currentTreatmentDetails)
                : l10n.commonNo,
          ),
          _ReviewRow(
            label: l10n.parentCaseRequestFormReviewPreferredContact,
            value: localizedCaseIntakePreferredContactPeriod(
              l10n,
              preferredContactPeriod,
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewRow extends StatelessWidget {
  const _ReviewRow({required this.label, required this.value});

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
          Text(value, style: theme.textTheme.bodyMedium),
        ],
      ),
    );
  }
}
