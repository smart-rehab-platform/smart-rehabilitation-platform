import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../providers/specialist_edit_profile_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/edit_profile_avatar_section.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'manage_goals_widgets.dart';

class EditSpecialistProfileScreen extends ConsumerStatefulWidget {
  const EditSpecialistProfileScreen({super.key});

  @override
  ConsumerState<EditSpecialistProfileScreen> createState() =>
      _EditSpecialistProfileScreenState();
}

class _EditSpecialistProfileScreenState
    extends ConsumerState<EditSpecialistProfileScreen> {
  late final TextEditingController _fullNameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _specializationController;
  late final TextEditingController _licenseController;
  late final TextEditingController _yearsController;
  late final TextEditingController _bioController;
  var _controllersSynced = false;

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController();
    _phoneController = TextEditingController();
    _specializationController = TextEditingController();
    _licenseController = TextEditingController();
    _yearsController = TextEditingController();
    _bioController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistEditProfileProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _specializationController.dispose();
    _licenseController.dispose();
    _yearsController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  void _syncControllers(SpecialistEditProfileState state) {
    if (_controllersSynced || state.isLoading) {
      return;
    }
    _fullNameController.text = state.fullName;
    _phoneController.text = state.phone;
    _specializationController.text = state.specialization;
    _licenseController.text = state.licenseNumber;
    _yearsController.text = state.yearsOfExperience;
    _bioController.text = state.bio;
    _controllersSynced = true;
  }

  Future<void> _save() async {
    final success = await ref
        .read(specialistEditProfileProvider.notifier)
        .save();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
      context.pop();
      return;
    }

    final current = ref.read(specialistEditProfileProvider);
    final message = current.validationMessage ?? current.errorMessage;
    if (message != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistEditProfileProvider);
    final notifier = ref.read(specialistEditProfileProvider.notifier);
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EditProfileAvatarSection(
              fullName: state.fullName,
              initialsFallback: 'SP',
              imageUrl: state.profileImageUrl,
              previewBytes: state.pendingImageBytes,
              isBusy: state.isSaving,
              onImageSelected: notifier.setPendingProfileImage,
              onImageError: (message) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(message)));
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
              decoration: goalFieldDecoration('Full name'),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _phoneController,
              onChanged: notifier.setPhone,
              keyboardType: TextInputType.phone,
              decoration: goalFieldDecoration('Phone'),
            ),
            SizedBox(height: context.dashSpacing * 1.1),
            Text(
              'Professional',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            TextField(
              controller: _specializationController,
              onChanged: notifier.setSpecialization,
              decoration: goalFieldDecoration('Specialization'),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _licenseController,
              onChanged: notifier.setLicenseNumber,
              decoration: goalFieldDecoration('License number'),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _yearsController,
              onChanged: notifier.setYearsOfExperience,
              keyboardType: TextInputType.number,
              decoration: goalFieldDecoration('Years of experience'),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            TextField(
              controller: _bioController,
              onChanged: notifier.setBio,
              maxLines: 4,
              decoration: goalFieldDecoration('Bio'),
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
              DashboardErrorCard(message: state.errorMessage!, onRetry: _save),
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
              child: Text(state.isSaving ? 'Saving...' : 'Save Changes'),
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
              child: const Text('Cancel'),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Edit Profile',
      showBackButton: true,
      body: body,
    );
  }
}
