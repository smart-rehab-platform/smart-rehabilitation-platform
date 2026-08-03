import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/auth_ui.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  static const _logoAsset = 'assets/branding/smart_rehab_horizontal_logo.png';
  static const _logoWidth = 220.0;
  static const _titleFontSize = 29.0;
  static const _rehabilitationColor = Color(0xFF2AA4C9);
  static const _subtitleFontSize = 12.5;
  static const _subtitleOpacity = 0.92;

  @override
  Widget build(BuildContext context) {
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
                const Spacer(flex: 2),
                const SizedBox(height: 12),
                Center(
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
                const SizedBox(height: 26),
                Text(
                  'Smart',
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
                  'Rehabilitation',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.syne(
                    fontSize: _titleFontSize,
                    fontWeight: FontWeight.w800,
                    height: 1.15,
                    color: _rehabilitationColor,
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  'Empowering rehabilitation through smart daily follow-up',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: _subtitleFontSize,
                    height: 1.6,
                    color: AppColors.lightBlue.withValues(alpha: _subtitleOpacity),
                  ),
                ),
                const SizedBox(height: 28),
                const Column(
                  children: [
                    AuthFeaturePill(
                      iconAsset: 'assets/icons/onboarding/neurology.svg',
                      text: 'AI Progress Tracking',
                      iconSize: 16,
                    ),
                    SizedBox(height: 10),
                    AuthFeaturePill(
                      iconAsset: 'assets/icons/onboarding/chart-bar.svg',
                      text: 'Smart Exercise Guidance',
                      iconSize: 16,
                    ),
                    SizedBox(height: 10),
                    AuthFeaturePill(
                      icon: Icons.mic_none_rounded,
                      text: 'Speech & Motion Analysis',
                      iconSize: 16,
                    ),
                  ],
                ),
                const Spacer(flex: 3),
                AuthGradientButton(
                  label: 'Get Started',
                  trailingIcon: Icons.chevron_right_rounded,
                  onPressed: () => context.go(AppRoutes.login),
                ),
                const SizedBox(height: 20),
                Text(
                  '© Smart Rehabilitation Platform',
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
