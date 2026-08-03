import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/locale/language_selector.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  static const _logoAsset = 'assets/branding/smart_rehab_horizontal_logo.png';
  static const _logoWidth = 220.0;
  static const _subtitleFontSize = 12.5;
  static const _subtitleOpacity = 0.92;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    final subtitle = Text(
      l10n.splashSubtitle,
      textAlign: TextAlign.center,
      style: GoogleFonts.inter(
        fontSize: _subtitleFontSize,
        height: 1.6,
        color: AppColors.lightBlue.withValues(
          alpha: _subtitleOpacity,
        ),
      ),
    );

    return Scaffold(
      body: AuthBackground(
        showBackgroundVideo: true,
        playbackSpeed: 0.5,
        videoUpperPortionOnly: true,
        overlayOpacity: 0.65,
        bottomFade: false,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
            child: Column(
              children: [
                const Align(
                  alignment: AlignmentDirectional.topEnd,
                  child: LanguageSelector(),
                ),
                const SizedBox(height: 8),
                const Spacer(flex: 2),
                const SizedBox(height: 12),
                Center(
                  child: Semantics(
                    label: l10n.appTitle,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.cyan.withValues(alpha: 0.09),
                            blurRadius: 58,
                            spreadRadius: 20,
                          ),
                        ],
                      ),
                      child: Image.asset(
                        _logoAsset,
                        width: _logoWidth,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 26),
                if (isArabic)
                  Transform.translate(
                    offset: const Offset(0, -20),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _SplashTitle(l10n: l10n),
                        const SizedBox(height: 14),
                        subtitle,
                      ],
                    ),
                  )
                else ...[
                  _SplashTitle(l10n: l10n),
                  const SizedBox(height: 14),
                  subtitle,
                ],
                const SizedBox(height: 28),
                Column(
                  children: [
                    AuthFeaturePill(
                      iconAsset: 'assets/icons/onboarding/neurology.svg',
                      text: l10n.splashFeatureAiProgress,
                      iconSize: 16,
                    ),
                    const SizedBox(height: 10),
                    AuthFeaturePill(
                      iconAsset: 'assets/icons/onboarding/chart-bar.svg',
                      text: l10n.splashFeatureExerciseGuidance,
                      iconSize: 16,
                    ),
                    const SizedBox(height: 10),
                    AuthFeaturePill(
                      icon: Icons.mic_none_rounded,
                      text: l10n.splashFeatureSpeechMotion,
                      iconSize: 16,
                    ),
                  ],
                ),
                const Spacer(flex: 3),
                AuthGradientButton(
                  label: l10n.splashGetStarted,
                  trailingIcon: Icons.chevron_right_rounded,
                  onPressed: () => context.go(AppRoutes.login),
                ),
                const SizedBox(height: 20),
                Text(
                  l10n.splashCopyright,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AppColors.lightBlue.withValues(alpha: 0.55),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SplashTitle extends StatelessWidget {
  const _SplashTitle({required this.l10n});

  final AppLocalizations l10n;

  static const _titleFontSize = 29.0;
  static const _rehabilitationColor = Color(0xFF2AA4C9);

  @override
  Widget build(BuildContext context) {
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    if (isArabic) {
      return Column(
        children: [
          Text(
            l10n.splashTitleLine1,
            textAlign: TextAlign.center,
            style: GoogleFonts.syne(
              fontSize: _titleFontSize,
              fontWeight: FontWeight.w800,
              height: 1.05,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            l10n.splashTitleSmart,
            textAlign: TextAlign.center,
            style: GoogleFonts.syne(
              fontSize: _titleFontSize,
              fontWeight: FontWeight.w800,
              height: 1.15,
              color: _rehabilitationColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            l10n.splashTitleRehabilitation,
            textAlign: TextAlign.center,
            style: GoogleFonts.syne(
              fontSize: _titleFontSize,
              fontWeight: FontWeight.w800,
              height: 1.15,
              color: AppColors.white,
            ),
          ),
        ],
      );
    }

    return Text.rich(
      TextSpan(
        style: GoogleFonts.syne(
          fontSize: _titleFontSize,
          fontWeight: FontWeight.w800,
          height: 1.05,
        ),
        children: [
          TextSpan(
            text: '${l10n.splashTitleSmart} ',
            style: const TextStyle(color: AppColors.white),
          ),
          TextSpan(
            text: l10n.splashTitleRehabilitation,
            style: const TextStyle(color: _rehabilitationColor, height: 1.15),
          ),
        ],
      ),
      textAlign: TextAlign.center,
    );
  }
}
