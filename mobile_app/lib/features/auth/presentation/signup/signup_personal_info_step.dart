import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../../shared/widgets/auth_ui.dart';
import 'signup_navigation_buttons.dart';
import 'signup_profile_photo_picker.dart';

class SignupPersonalInfoStep extends StatelessWidget {
  const SignupPersonalInfoStep({
    super.key,
    required this.fullNameController,
    required this.emailController,
    required this.phoneController,
    required this.emailState,
    required this.canContinue,
    required this.imageBytes,
    required this.onPickPhoto,
    required this.onBack,
    required this.onContinue,
  });

  final TextEditingController fullNameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final AuthFieldState emailState;
  final bool canContinue;
  final Uint8List? imageBytes;
  final VoidCallback onPickPhoto;
  final VoidCallback onBack;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SignupProfilePhotoPicker(
          imageBytes: imageBytes,
          onTap: onPickPhoto,
        ),
        const SizedBox(height: 18),
        AuthInputField(
          controller: fullNameController,
          label: 'Full Name',
          hintText: 'Dr. Sarah Johnson',
          icon: Icons.person_outline_rounded,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.name],
          textCapitalization: TextCapitalization.words,
        ),
        const SizedBox(height: 12),
        AuthInputField(
          controller: emailController,
          label: 'Email Address',
          hintText: 'name@example.com',
          icon: Icons.mail_outline_rounded,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          autofillHints: const [AutofillHints.email],
          state: emailState,
          message: emailState == AuthFieldState.error
              ? 'Invalid email address'
              : null,
        ),
        const SizedBox(height: 12),
        AuthInputField(
          controller: phoneController,
          label: 'Phone Number',
          hintText: '+970 59 000 0000',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          textInputAction: TextInputAction.done,
          autofillHints: const [AutofillHints.telephoneNumber],
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
