import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/auth_ui.dart';
import '../../utils/auth_localization_utils.dart';
import 'signup_navigation_buttons.dart';

class SignupSecurityStep extends StatelessWidget {
  const SignupSecurityStep({
    super.key,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.showPassword,
    required this.showConfirmPassword,
    required this.passwordState,
    required this.confirmPasswordState,
    required this.termsAccepted,
    required this.canContinue,
    required this.onTogglePassword,
    required this.onToggleConfirmPassword,
    required this.onTermsChanged,
    required this.onBack,
    required this.onContinue,
  });

  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final bool showPassword;
  final bool showConfirmPassword;
  final AuthFieldState passwordState;
  final AuthFieldState confirmPasswordState;
  final bool termsAccepted;
  final bool canContinue;
  final VoidCallback onTogglePassword;
  final VoidCallback onToggleConfirmPassword;
  final ValueChanged<bool> onTermsChanged;
  final VoidCallback onBack;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AuthInputField(
          controller: passwordController,
          label: l10n.fieldPassword,
          hintText: l10n.signupPasswordHint,
          icon: Icons.lock_outline_rounded,
          textInputAction: TextInputAction.next,
          obscureText: !showPassword,
          autofillHints: const [AutofillHints.newPassword],
          state: passwordState,
          message: passwordState == AuthFieldState.error
              ? localizedAuthStrongPasswordMessage(l10n)
              : null,
          suffix: IconButton(
            onPressed: onTogglePassword,
            tooltip: showPassword
                ? l10n.loginHidePassword
                : l10n.loginShowPassword,
            icon: Icon(
              showPassword
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined,
              size: 17,
              color: AppColors.lightBlue.withValues(alpha: 0.58),
            ),
          ),
        ),
        AuthPasswordStrengthIndicator(password: passwordController.text),
        const SizedBox(height: 12),
        AuthInputField(
          controller: confirmPasswordController,
          label: l10n.signupConfirmPassword,
          hintText: l10n.signupConfirmPasswordHint,
          icon: Icons.lock_outline_rounded,
          textInputAction: TextInputAction.done,
          obscureText: !showConfirmPassword,
          state: confirmPasswordState,
          message: confirmPasswordState == AuthFieldState.error
              ? l10n.authPasswordsDoNotMatch
              : null,
          suffix: IconButton(
            onPressed: onToggleConfirmPassword,
            tooltip: showConfirmPassword
                ? l10n.loginHidePassword
                : l10n.loginShowPassword,
            icon: Icon(
              showConfirmPassword
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined,
              size: 17,
              color: AppColors.lightBlue.withValues(alpha: 0.58),
            ),
          ),
        ),
        const SizedBox(height: 14),
        InkWell(
          onTap: () => onTermsChanged(!termsAccepted),
          borderRadius: BorderRadius.circular(8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 18,
                height: 18,
                child: Checkbox(
                  value: termsAccepted,
                  onChanged: (value) => onTermsChanged(value ?? false),
                  activeColor: AppColors.cyan,
                  side: BorderSide(
                    color: AppColors.lightBlue.withValues(alpha: 0.45),
                  ),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  visualDensity: VisualDensity.compact,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.signupTermsAgreement,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    height: 1.45,
                    color: AppColors.lightBlue,
                  ),
                ),
              ),
            ],
          ),
        ),
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
