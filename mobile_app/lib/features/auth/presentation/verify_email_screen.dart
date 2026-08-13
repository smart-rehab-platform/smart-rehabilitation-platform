import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../providers/auth_provider.dart';
import '../utils/auth_localization_utils.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/locale/language_selector.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';

enum _VerifyEmailStatus { pending, loading, success, error }

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key, this.initialToken, this.email});

  final String? initialToken;
  final String? email;

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  final _tokenController = TextEditingController();

  _VerifyEmailStatus _status = _VerifyEmailStatus.pending;
  String? _message;
  bool _isResending = false;
  bool _showTokenInput = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = _extractVerificationToken(widget.initialToken);
      if (token != null && token.isNotEmpty) {
        _verifyWithToken(token);
      }
    });
  }

  @override
  void dispose() {
    _tokenController.dispose();
    super.dispose();
  }

  String? _extractVerificationToken(String? rawValue) {
    final trimmed = rawValue?.trim() ?? '';
    if (trimmed.isEmpty) {
      return null;
    }

    final uri = Uri.tryParse(trimmed);
    final queryToken = uri?.queryParameters['token']?.trim();
    if (queryToken != null && queryToken.isNotEmpty) {
      return queryToken;
    }

    return trimmed;
  }

  Future<void> _verifyWithToken(String token) async {
    final l10n = AppLocalizations.of(context)!;
    setState(() {
      _status = _VerifyEmailStatus.loading;
      _message = l10n.verifyEmailVerifyingMessage;
    });

    final message = await ref
        .read(authProvider.notifier)
        .verifyEmail(token: token);

    if (!mounted) {
      return;
    }

    if (message != null) {
      setState(() {
        _status = _VerifyEmailStatus.success;
        _message = message;
      });
      return;
    }

    setState(() {
      _status = _VerifyEmailStatus.error;
      _message = mapAuthProviderError(
        l10n,
        ref.read(authProvider).errorMessage ?? l10n.verifyEmailFailedDefault,
      );
    });
  }

  Future<void> _verifyFromInput() async {
    final l10n = AppLocalizations.of(context)!;
    final token = _extractVerificationToken(_tokenController.text);
    if (token == null || token.isEmpty) {
      showAuthSnackBar(
        context,
        l10n.verifyEmailEnterToken,
        type: AuthSnackBarType.error,
      );
      return;
    }

    await _verifyWithToken(token);
  }

  Future<void> _resendVerification() async {
    final l10n = AppLocalizations.of(context)!;
    final email = widget.email?.trim() ?? '';
    if (email.isEmpty) {
      showAuthSnackBar(
        context,
        l10n.verifyEmailEmailMissing,
        type: AuthSnackBarType.error,
      );
      return;
    }

    setState(() => _isResending = true);

    final message = await ref
        .read(authProvider.notifier)
        .sendVerification(email: email);

    if (!mounted) {
      return;
    }

    setState(() => _isResending = false);

    if (message != null) {
      showAuthSnackBar(context, message, type: AuthSnackBarType.success);
      return;
    }

    showAuthSnackBar(
      context,
      mapAuthProviderError(
        l10n,
        ref.read(authProvider).errorMessage ?? l10n.verifyEmailResendFailed,
      ),
      type: AuthSnackBarType.error,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final email = widget.email?.trim();

    return Scaffold(
      body: AuthBackground(
        child: SafeArea(
          child: Column(
            children: [
              const Align(
                alignment: AlignmentDirectional.topEnd,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16, 10, 16, 0),
                  child: LanguageSelector(),
                ),
              ),
              Expanded(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 420),
                      child: AuthGlassCard(
                        child: switch (_status) {
                          _VerifyEmailStatus.pending => _buildPendingContent(
                            l10n,
                            email,
                          ),
                          _VerifyEmailStatus.loading => AuthStatusCard(
                            title: l10n.verifyEmailVerifyingTitle,
                            message:
                                _message ?? l10n.verifyEmailVerifyingMessage,
                            isLoading: true,
                            icon: Icons.mark_email_read_outlined,
                          ),
                          _VerifyEmailStatus.success => AuthStatusCard(
                            title: l10n.verifyEmailSuccessTitle,
                            message: l10n.verifyEmailSuccessMessage,
                            buttonLabel: l10n.verifyEmailGoToLogin,
                            onPressed: () => context.go(AppRoutes.login),
                            icon: Icons.verified_user_rounded,
                          ),
                          _VerifyEmailStatus.error => AuthStatusCard(
                            title: l10n.verifyEmailFailedTitle,
                            message:
                                _message ?? l10n.verifyEmailFailedDefault,
                            buttonLabel: l10n.verifyEmailBackToSignIn,
                            onPressed: () => context.go(AppRoutes.login),
                            isError: true,
                          ),
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPendingContent(AppLocalizations l10n, String? email) {
    final authState = ref.watch(authProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AuthStatusCard(
          title: l10n.verifyEmailCheckTitle,
          message: l10n.verifyEmailCheckMessage,
          icon: Icons.mark_email_unread_outlined,
        ),
        if (email != null && email.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(
            email,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.white,
            ),
          ),
        ],
        const SizedBox(height: 18),
        AuthGradientButton(
          label: _isResending
              ? l10n.verifyEmailResending
              : l10n.verifyEmailResend,
          trailingIcon: Icons.refresh_rounded,
          isLoading: _isResending || authState.isLoading,
          onPressed: _isResending || authState.isLoading
              ? null
              : _resendVerification,
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () {
            setState(() => _showTokenInput = !_showTokenInput);
          },
          child: Text(
            _showTokenInput
                ? l10n.verifyEmailHideManual
                : l10n.verifyEmailShowManual,
            style: GoogleFonts.inter(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: AppColors.cyan,
            ),
          ),
        ),
        if (_showTokenInput) ...[
          const SizedBox(height: 8),
          AuthInputField(
            controller: _tokenController,
            label: l10n.verifyEmailTokenLabel,
            hintText: l10n.verifyEmailTokenHint,
            icon: Icons.link_rounded,
            textInputAction: TextInputAction.done,
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          AuthGradientButton(
            label: l10n.verifyEmailVerifyButton,
            trailingIcon: Icons.verified_user_outlined,
            isLoading: authState.isLoading,
            onPressed: authState.isLoading ? null : _verifyFromInput,
          ),
        ],
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => context.go(AppRoutes.login),
          child: Text(
            l10n.verifyEmailBackToSignIn,
            style: GoogleFonts.inter(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: AppColors.lightBlue,
            ),
          ),
        ),
      ],
    );
  }
}
