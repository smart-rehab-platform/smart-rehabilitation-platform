import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_colors.dart';
import '../../models/signup_wizard_models.dart';
import '../../utils/signup_wizard_helpers.dart';
import 'signup_navigation_buttons.dart';

class SignupReviewStep extends StatelessWidget {
  const SignupReviewStep({
    super.key,
    required this.selectedRole,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.specialistProfile,
    required this.imageBytes,
    required this.isLoading,
    required this.onEditStep,
    required this.onBack,
    required this.onCreateAccount,
  });

  final SignupRole? selectedRole;
  final String fullName;
  final String email;
  final String phone;
  final SpecialistProfileData specialistProfile;
  final Uint8List? imageBytes;
  final bool isLoading;
  final ValueChanged<int> onEditStep;
  final VoidCallback onBack;
  final VoidCallback onCreateAccount;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _ReviewSection(
          title: 'Account Type',
          onEdit: () => onEditStep(1),
          child: Text(
            formatRoleLabel(selectedRole),
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.white,
            ),
          ),
        ),
        _ReviewSection(
          title: 'Personal Details',
          onEdit: () => onEditStep(2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.cyan.withValues(alpha: 0.35),
                  ),
                  color: AppColors.authInputBackground,
                ),
                child: imageBytes != null
                    ? ClipOval(
                        child: Image.memory(imageBytes!, fit: BoxFit.cover),
                      )
                    : Icon(
                        Icons.camera_alt_outlined,
                        size: 16,
                        color: AppColors.lightBlue.withValues(alpha: 0.65),
                      ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _ReviewLine(fullName.trim().isEmpty ? '—' : fullName.trim()),
                    _ReviewLine(
                      email.trim().isEmpty ? '—' : email.trim(),
                      muted: true,
                    ),
                    _ReviewLine(
                      phone.trim().isEmpty ? '—' : phone.trim(),
                      muted: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (selectedRole == SignupRole.specialist)
          _ReviewSection(
            title: 'Professional Details',
            onEdit: () => onEditStep(3),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _ReviewLabelValue(
                  label: 'Specialization',
                  value: specialistProfile.specialization.trim().isEmpty
                      ? '—'
                      : specialistProfile.specialization.trim(),
                ),
                const SizedBox(height: 8),
                _ReviewLabelValue(
                  label: 'License Number',
                  value: specialistProfile.licenseNumber.trim().isEmpty
                      ? '—'
                      : specialistProfile.licenseNumber.trim(),
                ),
                const SizedBox(height: 8),
                _ReviewLabelValue(
                  label: 'Experience',
                  value: formatExperience(specialistProfile.yearsOfExperience),
                ),
                if (specialistProfile.bio.trim().isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _ReviewLabelValue(
                    label: 'Bio',
                    value: specialistProfile.bio.trim(),
                    clamp: true,
                  ),
                ],
              ],
            ),
          ),
        _ReviewSection(
          title: 'Security',
          onEdit: () => onEditStep(signupSecurityStep),
          isLast: true,
          child: Row(
            children: [
              const Icon(
                Icons.check_circle_rounded,
                size: 14,
                color: AppColors.success,
              ),
              const SizedBox(width: 6),
              Icon(
                Icons.lock_outline_rounded,
                size: 14,
                color: AppColors.lightBlue.withValues(alpha: 0.65),
              ),
              const SizedBox(width: 6),
              Text(
                'Password created securely',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.white,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Text(
          'By creating this account, you confirm that the information above is accurate.',
          style: GoogleFonts.inter(
            fontSize: 10.5,
            height: 1.45,
            color: AppColors.lightBlue.withValues(alpha: 0.65),
          ),
        ),
        const SizedBox(height: 16),
        SignupNavigationButtons(
          onBack: onBack,
          onContinue: onCreateAccount,
          continueEnabled: !isLoading,
          isLoading: isLoading,
          continueLabel: isLoading ? 'Creating Account...' : 'Create Account',
        ),
      ],
    );
  }
}

class _ReviewSection extends StatelessWidget {
  const _ReviewSection({
    required this.title,
    required this.onEdit,
    required this.child,
    this.isLast = false,
  });

  final String title;
  final VoidCallback onEdit;
  final Widget child;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Text(
              title.toUpperCase(),
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.6,
                color: AppColors.lightBlue.withValues(alpha: 0.62),
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: onEdit,
              style: TextButton.styleFrom(
                foregroundColor: AppColors.cyan,
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'Edit',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        child,
        if (!isLast) ...[
          const SizedBox(height: 12),
          Divider(
            height: 1,
            color: AppColors.cyan.withValues(alpha: 0.14),
          ),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

class _ReviewLine extends StatelessWidget {
  const _ReviewLine(this.text, {this.muted = false});

  final String text;
  final bool muted;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Text(
        text,
        style: GoogleFonts.inter(
          fontSize: muted ? 11.5 : 13,
          fontWeight: muted ? FontWeight.w500 : FontWeight.w600,
          color: muted
              ? AppColors.lightBlue.withValues(alpha: 0.72)
              : AppColors.white,
        ),
      ),
    );
  }
}

class _ReviewLabelValue extends StatelessWidget {
  const _ReviewLabelValue({
    required this.label,
    required this.value,
    this.clamp = false,
  });

  final String label;
  final String value;
  final bool clamp;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10.5,
            fontWeight: FontWeight.w500,
            color: AppColors.lightBlue.withValues(alpha: 0.65),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: clamp ? 2 : null,
          overflow: clamp ? TextOverflow.ellipsis : null,
          style: GoogleFonts.inter(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}
