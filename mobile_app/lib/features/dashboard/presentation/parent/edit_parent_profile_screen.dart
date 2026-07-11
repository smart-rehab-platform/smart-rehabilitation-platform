import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../providers/parent_edit_profile_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/edit_profile_avatar_section.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import '../specialist/manage_goals_widgets.dart';

class EditParentProfileScreen extends ConsumerStatefulWidget {
  const EditParentProfileScreen({super.key});

  @override
  ConsumerState<EditParentProfileScreen> createState() =>
      _EditParentProfileScreenState();
}

class _EditParentProfileScreenState extends ConsumerState<EditParentProfileScreen> {
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

  void _syncControllers(ParentEditProfileState state) {
    if (_controllersSynced || state.isLoading) {
      return;
    }
    _fullNameController.text = state.fullName;
    _phoneController.text = state.phone;
    _addressController.text = state.address;
    _relationshipNotesController.text = state.relationshipNotes;
    _controllersSynced = true;
  }

  Future<void> _save() async {
    final success = await ref.read(parentEditProfileProvider.notifier).save();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
      context.pop();
      return;
    }

    final current = ref.read(parentEditProfileProvider);
    final message = current.validationMessage ?? current.errorMessage;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentEditProfileProvider);
    final notifier = ref.read(parentEditProfileProvider.notifier);
    final theme = Theme.of(context);

    _syncControllers(state);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && !_controllersSynced) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
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
                  SnackBar(content: Text(message)),
                );
              },
            ),
            SizedBox(height: context.dashSpacing),
            Text(
              'Personal',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _fullNameController,
              onChanged: notifier.setFullName,
              textInputAction: TextInputAction.next,
              decoration: goalFieldDecoration('Full name'),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _phoneController,
              onChanged: notifier.setPhone,
              keyboardType: TextInputType.phone,
              textInputAction: TextInputAction.next,
              decoration: goalFieldDecoration('Phone'),
            ),
            SizedBox(height: context.dashSpacing * 1.1),
            Text(
              'Parent Details',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _addressController,
              onChanged: notifier.setAddress,
              textInputAction: TextInputAction.next,
              minLines: 1,
              maxLines: 3,
              decoration: goalFieldDecoration('Address'),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _relationshipNotesController,
              onChanged: notifier.setRelationshipNotes,
              minLines: 3,
              maxLines: 6,
              decoration: goalFieldDecoration('Relationship notes'),
            ),
            if (state.validationMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: state.validationMessage!,
                onRetry: _save,
              ),
            ],
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: _save,
              ),
            ],
            SizedBox(height: context.dashSpacing),
            ElevatedButton(
              onPressed: state.isSaving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: DashboardColors.primary,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.65,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(state.isSaving ? 'Saving...' : 'Save Changes'),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            OutlinedButton(
              onPressed: state.isSaving ? null : () => context.pop(),
              style: OutlinedButton.styleFrom(
                foregroundColor: DashboardColors.primary,
                side: const BorderSide(color: DashboardColors.primary),
                padding: EdgeInsets.symmetric(
                  vertical: context.dashSpacing * 0.65,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Cancel'),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return ParentPageScaffold(
      title: 'Edit Profile',
      showBackButton: true,
      body: body,
    );
  }
}
