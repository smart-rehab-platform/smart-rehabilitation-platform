import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/auth_ui.dart';
import '../../utils/auth_localization_utils.dart';
import '../../utils/signup_wizard_helpers.dart';
import 'signup_navigation_buttons.dart';

class SignupProfessionalInfoStep extends StatelessWidget {
  const SignupProfessionalInfoStep({
    super.key,
    required this.specializationController,
    required this.licenseNumberController,
    required this.yearsController,
    required this.bioController,
    required this.canContinue,
    required this.onBack,
    required this.onContinue,
  });

  final TextEditingController specializationController;
  final TextEditingController licenseNumberController;
  final TextEditingController yearsController;
  final TextEditingController bioController;
  final bool canContinue;
  final VoidCallback onBack;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final specializationResult = validateSpecialization(
      specializationController.text,
    );
    final licenseResult = validateLicenseNumber(licenseNumberController.text);
    final yearsResult = validateYearsOfExperience(yearsController.text);
    final bioResult = validateBio(bioController.text);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AuthInputField(
          controller: specializationController,
          label: l10n.fieldSpecialization,
          hintText: l10n.signupSpecializationHint,
          icon: Icons.work_outline_rounded,
          textInputAction: TextInputAction.next,
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 12),
        LayoutBuilder(
          builder: (context, constraints) {
            final sideBySide = constraints.maxWidth >= 340;
            final licenseField = AuthInputField(
              controller: licenseNumberController,
              label: l10n.fieldLicenseNumber,
              hintText: l10n.fieldLicenseNumber,
              icon: Icons.badge_outlined,
              textInputAction: TextInputAction.next,
            );
            final yearsField = AuthInputField(
              controller: yearsController,
              label: l10n.fieldYearsOfExperience,
              hintText: l10n.fieldYearsOfExperience,
              icon: Icons.numbers_rounded,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.next,
            );

            if (sideBySide) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: licenseField),
                  const SizedBox(width: 10),
                  Expanded(child: yearsField),
                ],
              );
            }

            return Column(
              children: [licenseField, const SizedBox(height: 12), yearsField],
            );
          },
        ),
        const SizedBox(height: 12),
        _BioField(
          controller: bioController,
          isValid: bioResult.valid,
          message: bioResult.valid
              ? null
              : mapSignupValidationMessage(l10n, bioResult.message),
        ),
        if (!canContinue &&
            (!specializationResult.valid ||
                !licenseResult.valid ||
                !yearsResult.valid ||
                !bioResult.valid)) ...[
          const SizedBox(height: 8),
        ],
        const SizedBox(height: 18),
        SignupNavigationButtons(
          onBack: onBack,
          onContinue: onContinue,
          continueEnabled: canContinue,
          continueLabel: l10n.commonContinue,
        ),
      ],
    );
  }
}

class _BioField extends StatelessWidget {
  const _BioField({
    required this.controller,
    required this.isValid,
    this.message,
  });

  final TextEditingController controller;
  final bool isValid;
  final String? message;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final length = controller.text.length;
    final borderColor = !isValid && length > 500
        ? AppColors.danger
        : AppColors.authBorder.withValues(alpha: 0.85);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.fieldBio,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.lightBlue,
          ),
        ),
        const SizedBox(height: 6),
        ListenableBuilder(
          listenable: controller,
          builder: (context, _) {
            final length = controller.text.length;
            return TextFormField(
              controller: controller,
              maxLines: 4,
              minLines: 3,
              maxLength: 500,
              maxLengthEnforcement: MaxLengthEnforcement.enforced,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.white,
              ),
              decoration: InputDecoration(
                hintText: l10n.signupBioHint,
                counterText: l10n.signupBioCounter(length),
                hintStyle: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.authPlaceholder,
                ),
                filled: true,
                fillColor: AppColors.authInputBackground,
                contentPadding: const EdgeInsets.all(14),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: AppColors.cyan.withValues(alpha: 0.85),
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.danger),
                ),
              ),
            );
          },
        ),
        if (message != null) ...[
          const SizedBox(height: 4),
          Text(
            message!,
            style: GoogleFonts.inter(fontSize: 10, color: AppColors.danger),
          ),
        ],
      ],
    );
  }
}
