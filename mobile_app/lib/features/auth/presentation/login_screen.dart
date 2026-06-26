import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/app_logo.dart';
import '../../../shared/widgets/custom_text_field.dart';
import '../../../shared/widgets/password_text_field.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/responsive_layout.dart';
import '../../../shared/widgets/section_title.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
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
                  SizedBox(height: context.spacingUnit * 2),
                  const Center(child: AppLogo()),
                  SizedBox(height: context.spacingUnit * 2),
                  SectionTitle(
                    title: 'Welcome Back',
                    subtitle: 'Continue your smart rehabilitation journey',
                    alignment: CrossAxisAlignment.center,
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.spacingUnit * 2),
                  CustomTextField(
                    controller: _emailController,
                    label: 'Email',
                    hint: 'Enter your email',
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
                  PasswordTextField(
                    controller: _passwordController,
                    label: 'Password',
                    hint: 'Enter your password',
                    textInputAction: TextInputAction.done,
                  ),
                  SizedBox(height: context.spacingUnit * 0.5),
                  Row(
                    children: [
                      Expanded(
                        child: CheckboxListTile(
                          value: _rememberMe,
                          onChanged: (value) {
                            setState(() => _rememberMe = value ?? false);
                          },
                          contentPadding: EdgeInsets.zero,
                          controlAffinity: ListTileControlAffinity.leading,
                          activeColor: theme.colorScheme.primary,
                          checkColor: theme.colorScheme.onPrimary,
                          side: BorderSide(
                            color: theme.colorScheme.onSurfaceVariant
                                .withValues(alpha: 0.5),
                          ),
                          title: Text(
                            'Remember Me',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          dense: true,
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: Text(
                          'Forgot Password?',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: context.spacingUnit),
                  PrimaryButton(
                    label: 'Sign In',
                    onPressed: () {},
                  ),
                  SizedBox(height: context.spacingUnit * 2),
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        "Don't have an account?",
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      TextButton(
                        onPressed: () => context.go(AppRoutes.signup),
                        child: Text(
                          'Create Account',
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
