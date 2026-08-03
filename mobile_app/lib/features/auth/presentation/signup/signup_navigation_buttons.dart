import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/auth_ui.dart';

class SignupNavigationButtons extends StatelessWidget {
  const SignupNavigationButtons({
    super.key,
    required this.onBack,
    required this.onContinue,
    required this.continueLabel,
    this.continueEnabled = true,
    this.isLoading = false,
    this.showBack = true,
  });

  final VoidCallback onBack;
  final VoidCallback? onContinue;
  final String continueLabel;
  final bool continueEnabled;
  final bool isLoading;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (showBack) ...[
          Expanded(
            child: OutlinedButton(
              onPressed: isLoading ? null : onBack,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.lightBlue,
                side: BorderSide(
                  color: AppColors.authBorder.withValues(alpha: 0.85),
                ),
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(
                'Back',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
        ],
        Expanded(
          child: AuthGradientButton(
            label: continueLabel,
            trailingIcon: Icons.chevron_right_rounded,
            isLoading: isLoading,
            onPressed: continueEnabled && !isLoading ? onContinue : null,
          ),
        ),
      ],
    );
  }
}
