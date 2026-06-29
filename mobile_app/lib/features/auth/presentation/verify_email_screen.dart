import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
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
  String _message =
      'Please check your email and open the verification link on this device.';
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
    setState(() {
      _status = _VerifyEmailStatus.loading;
      _message = 'We are verifying your email now.';
    });

    final message =
        await ref.read(authProvider.notifier).verifyEmail(token: token);

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
      _message =
          ref.read(authProvider).errorMessage ??
          'Unable to verify your email right now.';
    });
  }

  Future<void> _verifyFromInput() async {
    final token = _extractVerificationToken(_tokenController.text);
    if (token == null || token.isEmpty) {
      showAuthSnackBar(
        context,
        'Enter the verification token or paste the full verification link.',
        type: AuthSnackBarType.error,
      );
      return;
    }

    await _verifyWithToken(token);
  }

  Future<void> _resendVerification() async {
    final email = widget.email?.trim() ?? '';
    if (email.isEmpty) {
      showAuthSnackBar(
        context,
        'Email address is missing. Please sign up again or contact support.',
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
      ref.read(authProvider).errorMessage ??
          'Unable to resend the verification email right now.',
      type: AuthSnackBarType.error,
    );
  }

  @override
  Widget build(BuildContext context) {
    final email = widget.email?.trim();

    return Scaffold(
      body: AuthBackground(
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: AuthGlassCard(
                  child: switch (_status) {
                    _VerifyEmailStatus.pending => _buildPendingContent(email),
                    _VerifyEmailStatus.loading => AuthStatusCard(
                      title: 'Verifying Email',
                      message: _message,
                      isLoading: true,
                      icon: Icons.mark_email_read_outlined,
                    ),
                    _VerifyEmailStatus.success => AuthStatusCard(
                      title: 'Email Verified',
                      message:
                          'Your email has been verified successfully. You can now sign in.',
                      buttonLabel: 'Go to Login',
                      onPressed: () => context.go(AppRoutes.login),
                      icon: Icons.verified_user_rounded,
                    ),
                    _VerifyEmailStatus.error => AuthStatusCard(
                      title: 'Verification Failed',
                      message: _message,
                      buttonLabel: 'Back to Login',
                      onPressed: () => context.go(AppRoutes.login),
                      isError: true,
                    ),
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPendingContent(String? email) {
    final authState = ref.watch(authProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AuthStatusCard(
          title: 'Check Your Email',
          message:
              'We sent a verification link to your email address. Open the link on this device to activate your account.',
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
          label: _isResending ? 'Sending...' : 'Resend Verification Email',
          trailingIcon: Icons.refresh_rounded,
          isLoading: _isResending || authState.isLoading,
          onPressed: _isResending || authState.isLoading ? null : _resendVerification,
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () {
            setState(() => _showTokenInput = !_showTokenInput);
          },
          child: Text(
            _showTokenInput
                ? 'Hide manual verification'
                : 'Already have a verification link?',
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
            label: 'Verification link or token',
            hintText: 'Paste the link or token from your email',
            icon: Icons.link_rounded,
            textInputAction: TextInputAction.done,
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          AuthGradientButton(
            label: 'Verify Email',
            trailingIcon: Icons.verified_user_outlined,
            isLoading: authState.isLoading,
            onPressed: authState.isLoading ? null : _verifyFromInput,
          ),
        ],
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => context.go(AppRoutes.login),
          child: Text(
            'Back to Sign In',
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
