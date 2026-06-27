import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../utils/password_strength.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/auth_ui.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key, this.initialToken});

  final String? initialToken;

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  late final TextEditingController _tokenController;
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _showPassword = false;
  bool _showConfirmPassword = false;
  String? _successMessage;

  AuthFieldState get _passwordState {
    final password = _passwordController.text;
    if (password.isEmpty) {
      return AuthFieldState.idle;
    }

    return evaluateAuthPasswordStrength(password).isStrong
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  AuthFieldState get _confirmPasswordState {
    final confirmPassword = _confirmPasswordController.text;
    if (confirmPassword.isEmpty) {
      return AuthFieldState.idle;
    }

    return confirmPassword == _passwordController.text
        ? AuthFieldState.success
        : AuthFieldState.error;
  }

  @override
  void initState() {
    super.initState();
    _tokenController = TextEditingController(text: widget.initialToken ?? '');
  }

  @override
  void dispose() {
    _tokenController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final token = _tokenController.text.trim();
    final newPassword = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (token.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      showAuthSnackBar(
        context,
        'Please complete all required fields',
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_passwordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        authStrongPasswordMessage,
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_confirmPasswordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        'Passwords do not match.',
        type: AuthSnackBarType.error,
      );
      return;
    }

    final message = await ref
        .read(authProvider.notifier)
        .resetPassword(token: token, newPassword: newPassword);

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
        ref.read(authProvider).errorMessage ?? 'Failed to reset password.';
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
              final topGap = (constraints.maxHeight * 0.14).clamp(24.0, 110.0);

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
                                  title: 'Password Reset Complete',
                                  message:
                                      'Your password has been changed successfully.',
                                  buttonLabel: 'Sign In',
                                  onPressed: () => context.go(AppRoutes.login),
                                )
                              : Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Text(
                                      'Reset Password',
                                      style: GoogleFonts.syne(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Enter your reset token and choose a strong new password.',
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
                                      controller: _tokenController,
                                      label: 'Reset Token',
                                      hintText: 'Paste your reset token',
                                      icon: Icons.key_rounded,
                                      textInputAction: TextInputAction.next,
                                      onChanged: (_) => setState(() {}),
                                    ),
                                    const SizedBox(height: 12),
                                    AuthInputField(
                                      controller: _passwordController,
                                      label: 'New Password',
                                      hintText: 'Enter your new password',
                                      icon: Icons.lock_outline_rounded,
                                      textInputAction: TextInputAction.next,
                                      obscureText: !_showPassword,
                                      onChanged: (_) => setState(() {}),
                                      state: _passwordState,
                                      message:
                                          _passwordState == AuthFieldState.error
                                          ? authStrongPasswordMessage
                                          : null,
                                      suffix: IconButton(
                                        onPressed: () {
                                          setState(
                                            () =>
                                                _showPassword = !_showPassword,
                                          );
                                        },
                                        icon: Icon(
                                          _showPassword
                                              ? Icons.visibility_off_outlined
                                              : Icons.visibility_outlined,
                                          size: 17,
                                          color: AppColors.lightBlue.withValues(
                                            alpha: 0.58,
                                          ),
                                        ),
                                      ),
                                    ),
                                    AuthPasswordStrengthIndicator(
                                      password: _passwordController.text,
                                    ),
                                    const SizedBox(height: 12),
                                    AuthInputField(
                                      controller: _confirmPasswordController,
                                      label: 'Confirm New Password',
                                      hintText: 'Re-enter your new password',
                                      icon: Icons.lock_outline_rounded,
                                      textInputAction: TextInputAction.done,
                                      obscureText: !_showConfirmPassword,
                                      onChanged: (_) => setState(() {}),
                                      state: _confirmPasswordState,
                                      message:
                                          _confirmPasswordState ==
                                              AuthFieldState.error
                                          ? 'Passwords do not match.'
                                          : null,
                                      suffix: IconButton(
                                        onPressed: () {
                                          setState(
                                            () => _showConfirmPassword =
                                                !_showConfirmPassword,
                                          );
                                        },
                                        icon: Icon(
                                          _showConfirmPassword
                                              ? Icons.visibility_off_outlined
                                              : Icons.visibility_outlined,
                                          size: 17,
                                          color: AppColors.lightBlue.withValues(
                                            alpha: 0.58,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 18),
                                    AuthGradientButton(
                                      label: authState.isLoading
                                          ? 'Resetting Password...'
                                          : 'Reset Password',
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
