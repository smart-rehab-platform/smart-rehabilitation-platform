import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../utils/auth_localization_utils.dart';
import '../utils/password_strength.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/locale/language_selector.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
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
    final l10n = AppLocalizations.of(context)!;
    final token = _tokenController.text.trim();
    final newPassword = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (token.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      showAuthSnackBar(
        context,
        l10n.authCompleteRequiredFields,
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_passwordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        localizedAuthStrongPasswordMessage(l10n),
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (_confirmPasswordState == AuthFieldState.error) {
      showAuthSnackBar(
        context,
        l10n.authPasswordsDoNotMatch,
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

    final errorMessage = mapAuthProviderError(
      l10n,
      ref.read(authProvider).errorMessage ?? l10n.resetPasswordFailed,
    );
    showAuthSnackBar(context, errorMessage, type: AuthSnackBarType.error);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);
    final passwordRequirements = localizedAuthStrongPasswordMessage(l10n);

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
                          const SizedBox(width: 6),
                          const AuthTopLogo(
                            logoAsset: AuthTopLogo.brandingAsset,
                            logoSize: 26,
                            logoColor: Color(0xFF2AA4C9),
                          ),
                          const Spacer(),
                          const LanguageSelector(),
                        ],
                      ),
                      SizedBox(height: topGap.toDouble()),
                      ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 420),
                        child: AuthGlassCard(
                          child: _successMessage != null
                              ? AuthStatusCard(
                                  title: l10n.resetPasswordCompleteTitle,
                                  message: l10n.resetPasswordCompleteMessage,
                                  buttonLabel: l10n.commonSignIn,
                                  onPressed: () => context.go(AppRoutes.login),
                                )
                              : Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Text(
                                      l10n.resetPasswordTitle,
                                      style: GoogleFonts.syne(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      l10n.resetPasswordSubtitle,
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
                                      controller: _passwordController,
                                      label: l10n.resetPasswordNewPassword,
                                      hintText:
                                          l10n.resetPasswordNewPasswordHint,
                                      icon: Icons.lock_outline_rounded,
                                      textInputAction: TextInputAction.next,
                                      obscureText: !_showPassword,
                                      onChanged: (_) => setState(() {}),
                                      state: _passwordState,
                                      message:
                                          _passwordState == AuthFieldState.error
                                          ? passwordRequirements
                                          : null,
                                      suffix: IconButton(
                                        onPressed: () {
                                          setState(
                                            () =>
                                                _showPassword = !_showPassword,
                                          );
                                        },
                                        tooltip: _showPassword
                                            ? l10n.loginHidePassword
                                            : l10n.loginShowPassword,
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
                                      label: l10n.resetPasswordConfirmPassword,
                                      hintText: l10n.resetPasswordConfirmHint,
                                      icon: Icons.lock_outline_rounded,
                                      textInputAction: TextInputAction.done,
                                      obscureText: !_showConfirmPassword,
                                      onChanged: (_) => setState(() {}),
                                      state: _confirmPasswordState,
                                      message:
                                          _confirmPasswordState ==
                                              AuthFieldState.error
                                          ? l10n.authPasswordsDoNotMatch
                                          : null,
                                      suffix: IconButton(
                                        onPressed: () {
                                          setState(
                                            () => _showConfirmPassword =
                                                !_showConfirmPassword,
                                          );
                                        },
                                        tooltip: _showConfirmPassword
                                            ? l10n.loginHidePassword
                                            : l10n.loginShowPassword,
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
                                          ? l10n.resetPasswordResetting
                                          : l10n.resetPasswordTitle,
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
                                        l10n.resetPasswordBackToSignIn,
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
