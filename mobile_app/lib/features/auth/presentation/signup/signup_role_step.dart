import 'package:flutter/material.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

import '../../models/signup_wizard_models.dart';
import 'signup_navigation_buttons.dart';
import 'signup_onboarding_role_card.dart';

class SignupRoleStep extends StatelessWidget {
  const SignupRoleStep({
    super.key,
    required this.selectedRole,
    required this.onRoleSelected,
    required this.onContinue,
  });

  final SignupRole? selectedRole;
  final ValueChanged<SignupRole> onRoleSelected;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SignupOnboardingRoleCard(
          icon: Icons.groups_2_outlined,
          title: l10n.roleParent,
          description: l10n.signupRoleParentDescription,
          isSelected: selectedRole == SignupRole.parent,
          onTap: () => onRoleSelected(SignupRole.parent),
        ),
        const SizedBox(height: 10),
        SignupOnboardingRoleCard(
          icon: Icons.medical_services_outlined,
          title: l10n.roleSpecialist,
          description: l10n.signupRoleSpecialistDescription,
          isSelected: selectedRole == SignupRole.specialist,
          onTap: () => onRoleSelected(SignupRole.specialist),
        ),
        const SizedBox(height: 18),
        SignupNavigationButtons(
          showBack: false,
          onBack: () {},
          onContinue: onContinue,
          continueEnabled: selectedRole != null,
          continueLabel: l10n.commonContinue,
        ),
      ],
    );
  }
}
