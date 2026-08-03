import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/auth_ui.dart';
import '../../utils/password_strength.dart';
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AuthInputField(
          controller: passwordController,
          label: 'Password',
          hintText: 'Min. 8 characters',
          icon: Icons.lock_outline_rounded,
          textInputAction: TextInputAction.next,
          obscureText: !showPassword,
          autofillHints: const [AutofillHints.newPassword],
          state: passwordState,
          message: passwordState == AuthFieldState.error
              ? authStrongPasswordMessage
              : null,
          suffix: IconButton(
            onPressed: onTogglePassword,
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
          label: 'Confirm New Password',
          hintText: 'Re-enter your new password',
          icon: Icons.lock_outline_rounded,
          textInputAction: TextInputAction.done,
          obscureText: !showConfirmPassword,
          state: confirmPasswordState,
          message: confirmPasswordState == AuthFieldState.error
              ? 'Passwords do not match.'
              : null,
          suffix: IconButton(
            onPressed: onToggleConfirmPassword,
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
                  'I agree to the Terms of Service and Privacy Policy.',
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
          continueLabel: 'Continue',
        ),
      ],
    );
  }
}
