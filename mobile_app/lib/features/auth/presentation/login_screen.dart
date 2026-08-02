import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/routes/role_routing.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';
import '../../../core/locale/language_selector.dart';

String _localizedLoginErrorMessage(AppLocalizations l10n, String message) {
  final normalized = message.trim();
  switch (normalized) {
    case 'Unable to sign in right now. Please try again.':
      return l10n.loginUnableToSignIn;
    case 'Login failed. Please try again.':
      return l10n.loginFailed;
    default:
      return message;
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = false;
  bool _showPassword = false;
  bool _isLoadingRememberedLogin = true;
  bool _showVerifyEmailPrompt = false;

  bool get _isEmailValid {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      return true;
    }

    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email);
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadRememberedLogin());
  }

  Future<void> _loadRememberedLogin() async {
    final remembered = await ref
        .read(authProvider.notifier)
        .loadRememberedLogin();

    if (!mounted) {
      return;
    }

    setState(() {
      _rememberMe = remembered.rememberMe;
      if (remembered.email != null && remembered.email!.isNotEmpty) {
        _emailController.text = remembered.email!;
      }
      _isLoadingRememberedLogin = false;
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final l10n = AppLocalizations.of(context)!;
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      showAuthSnackBar(
        context,
        l10n.loginEnterEmailAndPassword,
        type: AuthSnackBarType.error,
      );
      return;
    }

    final success = await ref
        .read(authProvider.notifier)
        .login(email: email, password: password, rememberMe: _rememberMe);

    if (!mounted) {
      return;
    }

    if (success) {
      setState(() => _showVerifyEmailPrompt = false);
      showAuthSnackBar(
        context,
        l10n.loginSuccess,
        type: AuthSnackBarType.success,
      );

      final role = ref.read(authProvider).user?.role;
      final destination = RoleRouting.dashboardForRole(role);
      if (destination != null) {
        context.go(destination);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.loginUnableToDetermineRole)),
        );
        context.go(AppRoutes.login);
      }
      return;
    }

    final rawErrorMessage =
        ref.read(authProvider).errorMessage ?? l10n.loginFailed;

    setState(() {
      _showVerifyEmailPrompt = rawErrorMessage.toLowerCase().contains('verify');
    });

    showAuthSnackBar(
      context,
      _localizedLoginErrorMessage(l10n, rawErrorMessage),
      type: AuthSnackBarType.error,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: AuthBackground(
        showBackgroundVideo: true,
        bottomFade: false,
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
                            onPressed: () => context.go(AppRoutes.splash),
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
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              AuthTabSwitcher(
                                activeIndex: 0,
                                onTap: (index) {
                                  if (index == 1) {
                                    context.go(AppRoutes.signup);
                                  }
                                },
                              ),
                              const SizedBox(height: 22),
                              Text(
                                l10n.loginTitle,
                                style: GoogleFonts.syne(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                l10n.loginSubtitle,
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
                                label: l10n.fieldEmail,
                                hintText: l10n.loginEmailHint,
                                textDirection: TextDirection.ltr,
                                icon: Icons.mail_outline_rounded,
                                keyboardType: TextInputType.emailAddress,
                                textInputAction: TextInputAction.next,
                                autofillHints: const [AutofillHints.email],
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
                                    : l10n.authValidationInvalidEmail,
                              ),
                              const SizedBox(height: 14),
                              AuthInputField(
                                controller: _passwordController,
                                label: l10n.fieldPassword,
                                hintText: l10n.loginPasswordHint,
                                icon: Icons.lock_outline_rounded,
                                textInputAction: TextInputAction.done,
                                autofillHints: const [AutofillHints.password],
                                obscureText: !_showPassword,
                                suffix: IconButton(
                                  onPressed: () {
                                    setState(
                                      () => _showPassword = !_showPassword,
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
                              const SizedBox(height: 14),
                              Row(
                                children: [
                                  InkWell(
                                    borderRadius: BorderRadius.circular(8),
                                    onTap: () {
                                      setState(
                                        () => _rememberMe = !_rememberMe,
                                      );
                                    },
                                    child: Row(
                                      children: [
                                        AnimatedContainer(
                                          duration: const Duration(
                                            milliseconds: 160,
                                          ),
                                          width: 16,
                                          height: 16,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(
                                              5,
                                            ),
                                            border: Border.all(
                                              color: _rememberMe
                                                  ? AppColors.cyan
                                                  : AppColors.authBorder,
                                            ),
                                            color: _rememberMe
                                                ? AppColors.cyan
                                                : Colors.transparent,
                                          ),
                                          child: _rememberMe
                                              ? const Icon(
                                                  Icons.check,
                                                  size: 11,
                                                  color: AppColors.white,
                                                )
                                              : null,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          l10n.loginRememberMe,
                                          style: GoogleFonts.inter(
                                            fontSize: 11,
                                            color: AppColors.lightBlue,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Spacer(),
                                  TextButton(
                                    onPressed: () =>
                                        context.go(AppRoutes.forgotPassword),
                                    style: TextButton.styleFrom(
                                      foregroundColor: AppColors.cyan,
                                      padding: EdgeInsets.zero,
                                      minimumSize: Size.zero,
                                      tapTargetSize:
                                          MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    child: Text(
                                      l10n.loginForgotPassword,
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 18),
                              if (_showVerifyEmailPrompt) ...[
                                AuthGradientButton(
                                  label: l10n.loginGoToEmailVerification,
                                  trailingIcon: Icons.mark_email_read_outlined,
                                  onPressed: () {
                                    final email = _emailController.text.trim();
                                    if (email.isEmpty) {
                                      context.go(AppRoutes.verifyEmail);
                                      return;
                                    }

                                    context.go(
                                      '${AppRoutes.verifyEmail}?email=${Uri.encodeComponent(email)}',
                                    );
                                  },
                                ),
                                const SizedBox(height: 12),
                              ],
                              AuthGradientButton(
                                label: authState.isLoading
                                    ? l10n.loginSigningIn
                                    : l10n.commonSignIn,
                                trailingIcon: Icons.chevron_right_rounded,
                                isLoading:
                                    authState.isLoading ||
                                    _isLoadingRememberedLogin,
                                onPressed:
                                    authState.isLoading ||
                                        _isLoadingRememberedLogin
                                    ? null
                                    : _login,
                              ),
                              const SizedBox(height: 18),
                              Text.rich(
                                TextSpan(
                                  text: l10n.loginNoAccountPrompt,
                                  style: GoogleFonts.inter(
                                    fontSize: 11.5,
                                    color: AppColors.lightBlue,
                                  ),
                                  children: [
                                    WidgetSpan(
                                      alignment: PlaceholderAlignment.middle,
                                      child: GestureDetector(
                                        onTap: () =>
                                            context.go(AppRoutes.signup),
                                        child: Text(
                                          l10n.authCommonCreateAccount,
                                          style: GoogleFonts.inter(
                                            fontSize: 11.5,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.cyan,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                textAlign: TextAlign.center,
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
