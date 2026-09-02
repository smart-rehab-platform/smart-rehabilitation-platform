import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/locale/language_selector.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/routes/role_routing.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';
import '../providers/auth_provider.dart';

enum SpecialistVerificationMode { pending, rejected }

class SpecialistVerificationScreen extends ConsumerStatefulWidget {
  const SpecialistVerificationScreen({
    super.key,
    required this.mode,
  });

  final SpecialistVerificationMode mode;

  @override
  ConsumerState<SpecialistVerificationScreen> createState() =>
      _SpecialistVerificationScreenState();
}

class _SpecialistVerificationScreenState
    extends ConsumerState<SpecialistVerificationScreen> {
  bool _checking = false;
  bool _loggingOut = false;

  String get _expectedPath => widget.mode == SpecialistVerificationMode.rejected
      ? AppRoutes.specialistVerificationRejected
      : AppRoutes.specialistVerificationPending;

  Future<void> _checkStatus() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() => _checking = true);

    final user = await ref.read(authProvider.notifier).fetchCurrentUser();
    if (!mounted) {
      return;
    }

    final destination = RoleRouting.homeForUser(user ?? ref.read(authProvider).user);
    if (destination != null && destination != _expectedPath) {
      context.go(destination);
      return;
    }

    setState(() => _checking = false);
    showAuthSnackBar(
      context,
      l10n.specialistVerificationStillPending,
      type: AuthSnackBarType.success,
    );
  }

  Future<void> _logout() async {
    final l10n = AppLocalizations.of(context)!;
    setState(() => _loggingOut = true);

    try {
      await ref.read(authProvider.notifier).logout();
      if (!mounted) {
        return;
      }
      context.go(AppRoutes.login);
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() => _loggingOut = false);
      showAuthSnackBar(
        context,
        l10n.specialistVerificationLogoutFailed,
        type: AuthSnackBarType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final auth = ref.watch(authProvider);
    final isRejected = widget.mode == SpecialistVerificationMode.rejected;
    final busy = _checking || _loggingOut || auth.isLoading;

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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            AuthStatusCard(
                              title: isRejected
                                  ? l10n.specialistVerificationRejectedTitle
                                  : l10n.specialistVerificationPendingTitle,
                              message: isRejected
                                  ? l10n.specialistVerificationRejectedMessage
                                  : l10n.specialistVerificationPendingMessage,
                              icon: isRejected
                                  ? Icons.error_outline_rounded
                                  : Icons.hourglass_top_rounded,
                              isError: isRejected,
                              isLoading: _checking,
                            ),
                            if (!isRejected) ...[
                              const SizedBox(height: 18),
                              AuthGradientButton(
                                label: l10n.specialistVerificationCheckStatus,
                                trailingIcon: Icons.refresh_rounded,
                                isLoading: _checking,
                                onPressed: busy ? null : _checkStatus,
                              ),
                            ],
                            const SizedBox(height: 12),
                            TextButton(
                              onPressed: busy ? null : _logout,
                              child: Text(
                                _loggingOut
                                    ? l10n.specialistVerificationLoggingOut
                                    : l10n.specialistVerificationLogout,
                                style: GoogleFonts.inter(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.lightBlue.withValues(
                                    alpha: 0.9,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
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
}
