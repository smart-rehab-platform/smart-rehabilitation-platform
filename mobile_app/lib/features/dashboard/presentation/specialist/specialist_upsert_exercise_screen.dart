import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/theme/dashboard_theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_exercise_assignment_provider.dart';
import '../../providers/specialist_features_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'manage_goals_widgets.dart';
import 'specialist_exercises_localization_utils.dart';

class SpecialistUpsertExerciseScreen extends ConsumerStatefulWidget {
  const SpecialistUpsertExerciseScreen({
    super.key,
    this.exerciseId,
    this.useAdminChrome = false,
  });

  final String? exerciseId;
  final bool useAdminChrome;

  bool get isEditing => exerciseId != null && exerciseId!.trim().isNotEmpty;

  @override
  ConsumerState<SpecialistUpsertExerciseScreen> createState() =>
      _SpecialistUpsertExerciseScreenState();
}

class _PendingMedia {
  const _PendingMedia({
    required this.bytes,
    required this.filename,
    required this.mimeType,
  });

  final Uint8List bytes;
  final String filename;
  final String mimeType;

  bool get isImage => mimeType.startsWith('image/');
  bool get isVideo => mimeType.startsWith('video/');
  bool get isAudio => mimeType.startsWith('audio/');
  bool get isPdf => mimeType == 'application/pdf';
}

class _SpecialistUpsertExerciseScreenState
    extends ConsumerState<SpecialistUpsertExerciseScreen> {
  static const _maxBytes = 50 * 1024 * 1024;
  static const _allowedMime = {
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
  };

  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _instructionsController = TextEditingController();

  List<ExerciseCategoryItem> _categories = const [];
  String? _selectedCategoryId;
  String _selectedLanguage = SpecialistExerciseItem.defaultLanguage;
  String? _existingMediaUrl;
  _PendingMedia? _pendingMedia;
  bool _clearExistingMedia = false;

  bool _loadingCategories = true;
  bool _loadingExercise = false;
  bool _saving = false;
  bool _uploading = false;
  double? _uploadProgress;
  String? _errorMessage;
  String? _categoriesError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _loadCategories();
      if (widget.isEditing) {
        await _loadExercise();
      }
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() {
      _loadingCategories = true;
      _categoriesError = null;
    });
    try {
      final rows = await ref
          .read(specialistFeaturesRepositoryProvider)
          .fetchExerciseCategories();
      if (!mounted) return;
      setState(() {
        _categories = rows;
        _loadingCategories = false;
        if (_selectedCategoryId == null && rows.isNotEmpty) {
          _selectedCategoryId = rows.first.id;
        }
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loadingCategories = false;
        _categoriesError = 'Failed to load categories. Please retry.';
      });
    }
  }

  Future<void> _loadExercise() async {
    final id = widget.exerciseId?.trim();
    if (id == null || id.isEmpty) {
      return;
    }
    setState(() {
      _loadingExercise = true;
      _errorMessage = null;
    });
    try {
      final exercise = await ref
          .read(specialistFeaturesRepositoryProvider)
          .fetchExerciseById(id);
      if (!mounted) return;
      if (exercise == null) {
        setState(() {
          _loadingExercise = false;
          _errorMessage = 'Exercise not found.';
        });
        return;
      }
      setState(() {
        _loadingExercise = false;
        _titleController.text = exercise.title;
        _descriptionController.text = exercise.description ?? '';
        _instructionsController.text = exercise.instructions ?? '';
        _selectedCategoryId = exercise.categoryId ?? _selectedCategoryId;
        _selectedLanguage = exercise.normalizedLanguage;
        _existingMediaUrl = exercise.instructionMediaUrl;
        _clearExistingMedia = false;
        _pendingMedia = null;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loadingExercise = false;
        _errorMessage = 'Failed to load exercise details.';
      });
    }
  }

  String? _inferMime(String filename) {
    final lower = filename.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.mp3')) return 'audio/mpeg';
    if (lower.endsWith('.m4a')) return 'audio/mp4';
    if (lower.endsWith('.wav')) return 'audio/wav';
    if (lower.endsWith('.aac')) return 'audio/aac';
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.mp4')) return 'video/mp4';
    if (lower.endsWith('.mov')) return 'video/quicktime';
    return null;
  }

  Future<void> _pickMedia() async {
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);
    final choice = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_outlined),
              title: Text(l10n.specialistExerciseChooseImage),
              onTap: () => Navigator.pop(context, 'image'),
            ),
            ListTile(
              leading: const Icon(Icons.videocam_outlined),
              title: Text(l10n.specialistExerciseChooseVideo),
              onTap: () => Navigator.pop(context, 'video'),
            ),
            ListTile(
              leading: const Icon(Icons.audiotrack_outlined),
              title: Text(l10n.specialistExerciseChooseAudioFile),
              onTap: () => Navigator.pop(context, 'file'),
            ),
          ],
        ),
      ),
    );
    if (choice == null || !mounted) return;

    Uint8List? bytes;
    var filename = '';
    String? mimeType;

    if (choice == 'image') {
      final file = await ImagePicker().pickImage(source: ImageSource.gallery);
      if (file == null) return;
      bytes = await file.readAsBytes();
      filename = file.name;
      mimeType = _inferMime(filename) ?? 'image/jpeg';
    } else if (choice == 'video') {
      final file = await ImagePicker().pickVideo(source: ImageSource.gallery);
      if (file == null) return;
      bytes = await file.readAsBytes();
      filename = file.name;
      mimeType = _inferMime(filename) ?? 'video/mp4';
    } else {
      final result = await FilePicker.platform.pickFiles(withData: true);
      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;
      bytes = file.bytes;
      filename = file.name;
      mimeType = _inferMime(filename);
    }

    if (!mounted) return;
    final selectedBytes = bytes;
    final selectedMime = mimeType;
    final selectedName = filename.trim();
    if (selectedBytes == null || selectedMime == null || selectedName.isEmpty) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistExerciseUnableReadFile)),
      );
      return;
    }
    if (!_allowedMime.contains(selectedMime)) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistExerciseUnsupportedMediaType)),
      );
      return;
    }
    if (selectedBytes.length > _maxBytes) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistExerciseFileTooLarge)),
      );
      return;
    }

    setState(() {
      _pendingMedia = _PendingMedia(
        bytes: selectedBytes,
        filename: selectedName,
        mimeType: selectedMime,
      );
      _clearExistingMedia = false;
    });
  }

  void _removeMedia() {
    setState(() {
      _pendingMedia = null;
      if (_existingMediaUrl != null && _existingMediaUrl!.trim().isNotEmpty) {
        _clearExistingMedia = true;
        _existingMediaUrl = null;
      }
    });
  }

  Future<void> _save() async {
    if (_saving || _uploading) return;
    final l10n = AppLocalizations.of(context)!;
    final messenger = ScaffoldMessenger.of(context);

    final categoryId = _selectedCategoryId?.trim() ?? '';
    final title = _titleController.text.trim();
    if (categoryId.isEmpty) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistExerciseSelectCategory)),
      );
      return;
    }
    if (title.isEmpty) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.specialistExerciseTitleRequired)),
      );
      return;
    }

    setState(() {
      _saving = true;
      _errorMessage = null;
    });

    try {
      var mediaUrl = _clearExistingMedia ? null : _existingMediaUrl;
      if (_pendingMedia != null) {
        setState(() {
          _uploading = true;
          _uploadProgress = 0;
        });
        mediaUrl = await ref
            .read(specialistFeaturesRepositoryProvider)
            .uploadExerciseInstructionMedia(
              bytes: _pendingMedia!.bytes,
              filename: _pendingMedia!.filename,
              onSendProgress: (sent, total) {
                if (!mounted || total <= 0) return;
                setState(() => _uploadProgress = sent / total);
              },
            );
        if (!mounted) return;
        setState(() {
          _uploading = false;
          _uploadProgress = null;
          _existingMediaUrl = mediaUrl;
          _pendingMedia = null;
          _clearExistingMedia = false;
        });
      }

      final request = UpsertExerciseRequest(
        categoryId: categoryId,
        title: title,
        description: _descriptionController.text,
        instructions: _instructionsController.text,
        instructionMediaUrl: mediaUrl,
        language: _selectedLanguage,
        clearInstructionMedia: _clearExistingMedia && mediaUrl == null,
      );

      final repo = ref.read(specialistFeaturesRepositoryProvider);
      if (widget.isEditing) {
        await repo.updateExercise(
          exerciseId: widget.exerciseId!.trim(),
          request: request,
        );
        await ref
            .read(
              specialistExerciseDetailProvider(
                widget.exerciseId!.trim(),
              ).notifier,
            )
            .refresh();
      } else {
        await repo.createExercise(request);
      }

      await ref.read(specialistExercisesProvider.notifier).refresh();
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(
          content: Text(
            widget.isEditing
                ? l10n.specialistExerciseUpdatedSuccess
                : l10n.specialistExerciseCreatedSuccess,
          ),
        ),
      );
      Navigator.of(context).pop(true);
    } catch (error) {
      if (!mounted) return;
      final message = error.toString().replaceFirst('Exception: ', '');
      setState(() {
        _saving = false;
        _uploading = false;
        _uploadProgress = null;
        _errorMessage = message.isNotEmpty
            ? message
            : 'Failed to save exercise. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final busy = _saving || _uploading || _loadingExercise;
    final screenTitle = widget.isEditing
        ? l10n.specialistExerciseEditExercise
        : l10n.specialistAddExercise;

    Widget body;
    if (_loadingExercise && widget.isEditing) {
      body = const Center(child: DashboardLoadingCard());
    } else {
      body = ListView(
        padding: context.dashPadding,
        children: [
          Text(
            screenTitle,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            l10n.specialistExerciseFormSubtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing),
          if (_loadingCategories)
            const Center(child: CircularProgressIndicator())
          else if (_categoriesError != null)
            DashboardErrorCard(
              message: mapSpecialistExerciseUpsertCategoriesError(
                l10n,
                _categoriesError!,
              ),
              onRetry: _loadCategories,
            )
          else if (_categories.isEmpty)
            DashboardEmptyCard(message: l10n.specialistExerciseNoCategories)
          else
            DropdownButtonFormField<String>(
              key: ValueKey(_selectedCategoryId),
              initialValue: _selectedCategoryId,
              isExpanded: true,
              decoration: goalFieldDecoration(
                l10n.specialistExerciseCategoryField,
              ),
              items: _categories
                  .map(
                    (category) => DropdownMenuItem(
                      value: category.id,
                      child: Text(
                        category.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  )
                  .toList(),
              onChanged: busy
                  ? null
                  : (value) => setState(() => _selectedCategoryId = value),
            ),
          SizedBox(height: context.dashSpacing * 0.75),
          DropdownButtonFormField<String>(
            key: ValueKey(_selectedLanguage),
            initialValue: _selectedLanguage,
            isExpanded: true,
            decoration: goalFieldDecoration(
              l10n.specialistExerciseLanguageField,
            ),
            items: [
              DropdownMenuItem(value: 'en', child: Text(l10n.languageEnglish)),
              DropdownMenuItem(value: 'ar', child: Text(l10n.languageArabic)),
            ],
            onChanged: busy
                ? null
                : (value) {
                    if (value == null) return;
                    setState(() => _selectedLanguage = value);
                  },
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: _titleController,
            enabled: !busy,
            decoration: goalFieldDecoration(l10n.specialistExerciseTitleField),
            textCapitalization: TextCapitalization.sentences,
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: _descriptionController,
            enabled: !busy,
            maxLines: 3,
            decoration: goalFieldDecoration(
              l10n.specialistExerciseDescriptionOptional,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          TextField(
            controller: _instructionsController,
            enabled: !busy,
            maxLines: 6,
            decoration: goalFieldDecoration(
              l10n.specialistExerciseInstructionsField,
            ),
          ),
          SizedBox(height: context.dashSpacing),
          Text(
            l10n.specialistExerciseInstructionMediaSection,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          DashboardSurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_pendingMedia != null) ...[
                  Text(
                    _pendingMedia!.filename,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    _pendingMedia!.mimeType,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                  if (_pendingMedia!.isImage) ...[
                    SizedBox(height: context.dashSpacing * 0.5),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.memory(
                        _pendingMedia!.bytes,
                        height: 140,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ],
                ] else if (_existingMediaUrl != null &&
                    _existingMediaUrl!.trim().isNotEmpty) ...[
                  Text(
                    l10n.specialistExerciseCurrentMediaAttached,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    _existingMediaUrl!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                ] else
                  Text(
                    l10n.specialistExerciseNoMediaSelected,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                if (_uploading) ...[
                  SizedBox(height: context.dashSpacing * 0.5),
                  LinearProgressIndicator(value: _uploadProgress),
                ],
                SizedBox(height: context.dashSpacing * 0.65),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: busy ? null : _pickMedia,
                        icon: const Icon(Icons.attach_file_rounded),
                        label: Text(
                          _pendingMedia != null ||
                                  (_existingMediaUrl?.isNotEmpty ?? false)
                              ? l10n.specialistExerciseReplaceMedia
                              : l10n.specialistExerciseAddMedia,
                        ),
                      ),
                    ),
                    if (_pendingMedia != null ||
                        (_existingMediaUrl?.isNotEmpty ?? false)) ...[
                      SizedBox(width: context.dashSpacing * 0.5),
                      IconButton(
                        onPressed: busy ? null : _removeMedia,
                        icon: const Icon(Icons.delete_outline_rounded),
                        tooltip: l10n.specialistExerciseRemoveMediaTooltip,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          if (_errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: mapSpecialistExerciseUpsertError(
                l10n,
                mapSpecialistExerciseDetailError(l10n, _errorMessage!),
              ),
              onRetry: busy ? () {} : _save,
            ),
          ],
          SizedBox(height: context.dashSpacing),
          ElevatedButton.icon(
            onPressed: busy ? null : _save,
            icon: busy
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
              _uploading
                  ? l10n.specialistExerciseUploadingMedia
                  : _saving
                  ? l10n.commonSaving
                  : widget.isEditing
                  ? l10n.specialistTreatmentPlanSaveChanges
                  : l10n.specialistExerciseCreateExercise,
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: DashboardColors.brandCyan,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.7,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing),
        ],
      );
    }

    final wrappedBody = PopScope(canPop: !busy, child: body);

    if (widget.useAdminChrome) {
      return AdminPageScaffold(
        title: screenTitle,
        showBackButton: true,
        showBottomNav: false,
        body: Theme(data: DashboardTheme.light, child: wrappedBody),
      );
    }

    return SpecialistPageScaffold(
      title: screenTitle,
      showBackButton: true,
      body: wrappedBody,
    );
  }
}
