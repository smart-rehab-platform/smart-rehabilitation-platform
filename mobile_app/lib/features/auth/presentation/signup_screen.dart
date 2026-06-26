import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/app_logo.dart';
import '../../../shared/widgets/custom_card.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/password_text_field.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/responsive_layout.dart';
import '../../../shared/widgets/section_title.dart';

enum SignupRole { parent, specialist }

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  SignupRole? _selectedRole;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: AppColors.primaryNavy,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: context.responsivePadding,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: context.screenSize.width * 0.92,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SizedBox(height: context.spacingUnit * 1.5),
                  const Center(child: AppLogo()),
                  SizedBox(height: context.spacingUnit * 1.5),
                  SectionTitle(
                    title: 'Create Account',
                    subtitle: 'Join the Smart Rehabilitation Platform',
                    alignment: CrossAxisAlignment.center,
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.spacingUnit * 1.5),
                  _ProfilePhotoPlaceholder(),
                  SizedBox(height: context.spacingUnit * 1.5),
                  CustomTextField(
                    controller: _fullNameController,
                    label: 'Full Name',
                    hint: 'Enter your full name',
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.name],
                    textCapitalization: TextCapitalization.words,
                    prefixIcon: Icon(
                      Icons.person_outline,
                      size: context.iconSize,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: context.spacingUnit),
                  CustomTextField(
                    controller: _emailController,
                    label: 'Email Address',
                    hint: 'Enter your email address',
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    prefixIcon: Icon(
                      Icons.email_outlined,
                      size: context.iconSize,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: context.spacingUnit),
                  CustomTextField(
                    controller: _phoneController,
                    label: 'Phone Number',
                    hint: 'Enter your phone number',
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.telephoneNumber],
                    prefixIcon: Icon(
                      Icons.phone_outlined,
                      size: context.iconSize,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: context.spacingUnit),
                  PasswordTextField(
                    controller: _passwordController,
                    label: 'Password',
                    hint: 'Create a password',
                    textInputAction: TextInputAction.next,
                  ),
                  SizedBox(height: context.spacingUnit),
                  PasswordTextField(
                    controller: _confirmPasswordController,
                    label: 'Confirm Password',
                    hint: 'Re-enter your password',
                    textInputAction: TextInputAction.done,
                  ),
                  SizedBox(height: context.spacingUnit * 1.25),
                  SectionTitle(
                    title: 'Select Role',
                    subtitle: 'Choose how you will use the platform',
                  ),
                  SizedBox(height: context.spacingUnit * 0.75),
                  Row(
                    children: [
                      Expanded(
                        child: _RoleCard(
                          label: 'Parent',
                          description: 'Manage your child\'s rehabilitation journey',
                          icon: Icons.family_restroom_outlined,
                          isSelected: _selectedRole == SignupRole.parent,
                          onTap: () {
                            setState(() => _selectedRole = SignupRole.parent);
                          },
                        ),
                      ),
                      SizedBox(width: context.spacingUnit * 0.75),
                      Expanded(
                        child: _RoleCard(
                          label: 'Specialist',
                          description: 'Support patients and treatment plans',
                          icon: Icons.medical_services_outlined,
                          isSelected: _selectedRole == SignupRole.specialist,
                          onTap: () {
                            setState(() => _selectedRole = SignupRole.specialist);
                          },
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: context.spacingUnit * 1.5),
                  PrimaryButton(
                    label: 'Create My Account',
                    onPressed: () {},
                  ),
                  SizedBox(height: context.spacingUnit * 1.5),
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        'Already have an account?',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.go(AppRoutes.login),
                        child: Text(
                          'Sign In',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: context.spacingUnit),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfilePhotoPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final photoSize = context.logoSize * 0.85;

    return Column(
      children: [
        Container(
          width: photoSize,
          height: photoSize,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: theme.colorScheme.primaryContainer,
            border: Border.all(
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.35),
              width: photoSize * 0.025,
            ),
          ),
          child: Icon(
            Icons.camera_alt_outlined,
            size: photoSize * 0.32,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        SizedBox(height: context.spacingUnit * 0.75),
        Text(
          'Profile photo optional',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({
    required this.label,
    required this.description,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final String description;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(context.spacingUnit * 0.75),
        border: Border.all(
          color: isSelected
              ? theme.colorScheme.primary
              : theme.colorScheme.outline.withValues(alpha: 0.35),
          width: isSelected ? 2 : 1,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: AppColors.mediumBlue.withValues(alpha: 0.2),
                  blurRadius: context.spacingUnit * 0.5,
                ),
              ]
            : null,
      ),
      child: CustomCard(
        onTap: onTap,
        margin: EdgeInsets.zero,
        padding: EdgeInsets.all(context.spacingUnit * 0.875),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              icon,
              size: context.iconSize,
              color: isSelected
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurfaceVariant,
            ),
            SizedBox(height: context.spacingUnit * 0.5),
            Text(
              label,
              style: theme.textTheme.titleSmall?.copyWith(
                color: theme.colorScheme.onSurface,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.spacingUnit * 0.25),
            Text(
              description,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
