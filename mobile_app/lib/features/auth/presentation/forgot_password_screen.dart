import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/auth_ui.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  String? _successMessage;

  bool get _isEmailValid {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      return true;
    }

    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email);
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();

    if (email.isEmpty) {
      showAuthSnackBar(
        context,
        'Please enter your email address',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (!_isEmailValid) {
      showAuthSnackBar(
        context,
        'Please enter a valid email address',
        type: AuthSnackBarType.error,
      );
      return;
    }

    final message = await ref
        .read(authProvider.notifier)
        .forgotPassword(email: email);

    if (!mounted) {
      return;
    }

    if (message != null) {
      setState(() {
        _successMessage = message;
      });
      showAuthSnackBar(context, message, type: AuthSnackBarType.success);
      return;
    }

    final errorMessage =
        ref.read(authProvider).errorMessage ?? 'Failed to send reset link.';
    showAuthSnackBar(context, errorMessage, type: AuthSnackBarType.error);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: AuthBackground(
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final topGap = (constraints.maxHeight * 0.18).clamp(28.0, 140.0);

              return SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minHeight: constraints.maxHeight - 34,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          AuthBackButton(
                            onPressed: () => context.go(AppRoutes.login),
                          ),
                          const SizedBox(width: 10),
                          const AuthTopLogo(),
                        ],
                      ),
                      SizedBox(height: topGap.toDouble()),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 420),
                        child: AuthGlassCard(
                          child: _successMessage != null
                              ? AuthStatusCard(
                                  title: 'Reset Email Sent',
                                  message:
                                      'If an account exists with this email, a password reset link has been sent.',
                                  buttonLabel: 'Back to Sign In',
                                  onPressed: () => context.go(AppRoutes.login),
                                )
                              : Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Text(
                                      'Forgot Password',
                                      style: GoogleFonts.syne(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Enter your email address and we will send you a password reset link.',
                                      style: GoogleFonts.inter(
                                        fontSize: 12.5,
                                        height: 1.5,
                                        color: AppColors.lightBlue.withValues(
                                          alpha: 0.7,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 18),
                                    AuthInputField(
                                      controller: _emailController,
                                      label: 'Email Address',
                                      hintText: 'name@example.com',
                                      icon: Icons.mail_outline_rounded,
                                      keyboardType: TextInputType.emailAddress,
                                      textInputAction: TextInputAction.done,
                                      autofillHints: const [
                                        AutofillHints.email,
                                      ],
                                      onChanged: (_) => setState(() {}),
                                      state: _emailController.text.isEmpty
                                          ? AuthFieldState.idle
                                          : (_isEmailValid
                                                ? AuthFieldState.success
                                                : AuthFieldState.error),
                                      message:
                                          _emailController.text.isEmpty ||
                                              _isEmailValid
                                          ? null
                                          : 'Invalid email address',
                                    ),
                                    const SizedBox(height: 18),
                                    AuthGradientButton(
                                      label: authState.isLoading
                                          ? 'Sending Reset Link...'
                                          : 'Send Reset Link',
                                      trailingIcon: Icons.chevron_right_rounded,
                                      isLoading: authState.isLoading,
                                      onPressed: authState.isLoading
                                          ? null
                                          : _submit,
                                    ),
                                    const SizedBox(height: 18),
                                    TextButton(
                                      onPressed: () =>
                                          context.go(AppRoutes.login),
                                      child: Text(
                                        'Back to Sign In',
                                        style: GoogleFonts.inter(
                                          fontSize: 11.5,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.cyan,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
