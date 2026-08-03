import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../../../core/constants/app_colors.dart';
import '../../utils/signup_wizard_helpers.dart';

class SignupStepIndicator extends StatelessWidget {
  const SignupStepIndicator({
    super.key,
    required this.currentStep,
    this.totalSteps = signupWizardTotalSteps,
  });

  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(totalSteps * 2 - 1, (index) {
            if (index.isOdd) {
              final leftStep = (index ~/ 2) + 1;
              final isCompleted = leftStep < currentStep;
              return Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOut,
                  height: 2,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: isCompleted
                        ? AppColors.cyan.withValues(alpha: 0.85)
                        : AppColors.lightBlue.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              );
            }

            final stepNumber = (index ~/ 2) + 1;
            final isCompleted = stepNumber < currentStep;
            final isCurrent = stepNumber == currentStep;

            return _StepDot(isCompleted: isCompleted, isCurrent: isCurrent);
          }),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.signupStepProgress(currentStep, totalSteps),
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.lightBlue.withValues(alpha: 0.82),
          ),
        ),
      ],
    );
  }
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.isCompleted, required this.isCurrent});

  final bool isCompleted;
  final bool isCurrent;

  @override
  Widget build(BuildContext context) {
    final activeColor = AppColors.cyan;
    final size = isCurrent ? 11.0 : 9.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOut,
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isCompleted || isCurrent ? activeColor : Colors.transparent,
        border: Border.all(
          color: isCompleted || isCurrent
              ? activeColor
              : AppColors.lightBlue.withValues(alpha: 0.28),
          width: isCurrent ? 1.6 : 1.2,
        ),
        boxShadow: isCurrent
            ? [
                BoxShadow(
                  color: activeColor.withValues(alpha: 0.45),
                  blurRadius: 8,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
    );
  }
}
