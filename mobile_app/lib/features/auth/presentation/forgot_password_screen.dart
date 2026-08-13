import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../utils/auth_localization_utils.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/locale/language_selector.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key, this.initialEmail});

  final String? initialEmail;

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  late final TextEditingController _emailController;
  late final FocusNode _emailFocusNode;
  String? _successMessage;

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
    _emailController = TextEditingController(
      text: widget.initialEmail?.trim() ?? '',
    );
    _emailFocusNode = FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) {
        return;
      }

      _emailFocusNode.requestFocus();

      if (_emailController.text.isNotEmpty) {
        _emailController.selection = TextSelection(
          baseOffset: 0,
          extentOffset: _emailController.text.length,
        );
      }
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _emailFocusNode.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context)!;
    final email = _emailController.text.trim();

    if (email.isEmpty) {
      showAuthSnackBar(
        context,
        l10n.forgotPasswordEnterEmail,
        type: AuthSnackBarType.error,
      );
      return;
    }

    if (!_isEmailValid) {
      showAuthSnackBar(
        context,
        l10n.forgotPasswordEnterValidEmail,
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

    final errorMessage = mapAuthProviderError(
      l10n,
      ref.read(authProvider).errorMessage ?? l10n.forgotPasswordFailedSend,
    );
    showAuthSnackBar(context, errorMessage, type: AuthSnackBarType.error);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
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
                                  title: l10n.forgotPasswordResetEmailSentTitle,
                                  message:
                                      l10n.forgotPasswordResetEmailSentMessage,
                                  buttonLabel: l10n.forgotPasswordBackToSignIn,
                                  onPressed: () => context.go(AppRoutes.login),
                                )
                              : Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Text(
                                      l10n.forgotPasswordTitle,
                                      style: GoogleFonts.syne(
                                        fontSize: 24,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      l10n.forgotPasswordSubtitle,
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
                                      focusNode: _emailFocusNode,
                                      label: l10n.signupEmailAddress,
                                      hintText: l10n.loginEmailHint,
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
                                          : l10n.authValidationInvalidEmail,
                                    ),
                                    const SizedBox(height: 18),
                                    AuthGradientButton(
                                      label: authState.isLoading
                                          ? l10n.forgotPasswordSending
                                          : l10n.forgotPasswordSendLink,
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
                                        l10n.forgotPasswordBackToSignIn,
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
