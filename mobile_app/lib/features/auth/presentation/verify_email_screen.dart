import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/auth_ui.dart';

enum _VerifyEmailStatus { loading, success, error }

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key, this.initialToken});

  final String? initialToken;

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  _VerifyEmailStatus _status = _VerifyEmailStatus.loading;
  String _message = 'We are verifying your email now.';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _verify();
    });
  }

  Future<void> _verify() async {
    final token = widget.initialToken?.trim() ?? '';
    if (token.isEmpty) {
      setState(() {
        _status = _VerifyEmailStatus.error;
        _message = 'Verification link is missing or invalid.';
      });
      return;
    }

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
      _message =
          ref.read(authProvider).errorMessage ??
          'Unable to verify your email right now.';
    });
  }

  @override
  Widget build(BuildContext context) {
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
                    _VerifyEmailStatus.loading => AuthStatusCard(
                      title: 'Verifying Email',
                      message:
                          'Please wait while we confirm your email address.',
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
                      buttonLabel: 'Go to Login',
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
}
