import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../providers/parent_edit_profile_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/edit_profile_avatar_section.dart';
import '../../widgets/edit_profile_labeled_field.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import 'parent_scoped_localization_utils.dart';

class EditParentProfileScreen extends ConsumerStatefulWidget {
  const EditParentProfileScreen({super.key});

  @override
  ConsumerState<EditParentProfileScreen> createState() =>
      _EditParentProfileScreenState();
}

class _EditParentProfileScreenState
    extends ConsumerState<EditParentProfileScreen> {
  late final TextEditingController _fullNameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _addressController;
  late final TextEditingController _relationshipNotesController;
  var _controllersSynced = false;

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController();
    _phoneController = TextEditingController();
    _addressController = TextEditingController();
    _relationshipNotesController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentEditProfileProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _relationshipNotesController.dispose();
    super.dispose();
  }

  void _populateControllers(ParentEditProfileState state) {
    _fullNameController.text = state.fullName;
    _phoneController.text = state.phone;
    _addressController.text = state.address;
    _relationshipNotesController.text = state.relationshipNotes;
  }

  void _listenForProfileLoad() {
    ref.listen<ParentEditProfileState>(parentEditProfileProvider, (
      previous,
      next,
    ) {
      if (next.isLoading) {
        _controllersSynced = false;
        return;
      }
      if (_controllersSynced || next.errorMessage != null) {
        return;
      }
      _populateControllers(next);
      _controllersSynced = true;
    });
  }

  Future<void> _save() async {
    final success = await ref.read(parentEditProfileProvider.notifier).save();
    if (!mounted) return;

    final l10n = AppLocalizations.of(context)!;

    if (success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.parentProfileUpdatedSuccess)));
      context.pop();
      return;
    }

    final current = ref.read(parentEditProfileProvider);
    final rawMessage = current.validationMessage ?? current.errorMessage;
    if (rawMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapParentProfileError(l10n, rawMessage))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentEditProfileProvider);
    final notifier = ref.read(parentEditProfileProvider.notifier);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    _listenForProfileLoad();

    Widget body;
    if (state.isLoading || (state.errorMessage == null && !_controllersSynced)) {
      body = Center(
        child: DashboardLoadingCard(message: l10n.parentProfileLoading),
      );
    } else if (state.errorMessage != null && !_controllersSynced) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapParentProfileError(l10n, state.errorMessage!),
          onRetry: notifier.initialize,
        ),
      );
    } else {
      body = SingleChildScrollView(
        padding: context.dashPadding,
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EditProfileAvatarSection(
              fullName: state.fullName,
              initialsFallback: 'PR',
              imageUrl: state.profileImageUrl,
              previewBytes: state.pendingImageBytes,
              isBusy: state.isSaving,
              onImageSelected: notifier.setPendingProfileImage,
              onImageError: (message) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(mapParentProfileError(l10n, message))),
                );
              },
            ),
            SizedBox(height: context.dashSpacing),
            Text(
              l10n.parentProfilePersonalSection,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            EditProfileLabeledField(
              label: l10n.fieldFullName,
              controller: _fullNameController,
              onChanged: notifier.setFullName,
              textInputAction: TextInputAction.next,
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            EditProfileLabeledField(
              label: l10n.fieldPhone,
              controller: _phoneController,
              onChanged: notifier.setPhone,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
            ),
            SizedBox(height: context.dashSpacing * 1.1),
            Text(
              l10n.parentProfileParentDetails,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            EditProfileLabeledField(
              label: l10n.fieldAddress,
              controller: _addressController,
              onChanged: notifier.setAddress,
              textInputAction: TextInputAction.next,
              minLines: 1,
              maxLines: 3,
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            EditProfileLabeledField(
              label: l10n.parentProfileRelationshipNotes,
              controller: _relationshipNotesController,
              onChanged: notifier.setRelationshipNotes,
              minLines: 3,
              maxLines: 6,
            ),
            if (state.validationMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: mapParentProfileError(l10n, state.validationMessage!),
                onRetry: _save,
              ),
            ],
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: mapParentProfileError(l10n, state.errorMessage!),
                onRetry: _save,
              ),
            ],
            SizedBox(height: context.dashSpacing),
            ElevatedButton(
              onPressed: state.isSaving ? null : _save,
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
              child: Text(
                state.isSaving
                    ? l10n.commonSaving
                    : l10n.parentProfileSaveChanges,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            OutlinedButton(
              onPressed: state.isSaving ? null : () => context.pop(),
              style: OutlinedButton.styleFrom(
                foregroundColor: DashboardColors.brandCyan,
                side: const BorderSide(color: DashboardColors.brandCyan),
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.65,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(l10n.commonCancel),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return ParentPageScaffold(
      title: l10n.parentProfileEditProfile,
      showBackButton: true,
      body: body,
    );
  }
}
