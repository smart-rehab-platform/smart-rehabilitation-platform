import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../shared/widgets/auth_ui.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AuthBackground(
        overlayOpacity: 0.65,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
            child: Column(
              children: [
                const Spacer(flex: 2),
                const AuthLogoMark(size: 86),
                const SizedBox(height: 26),
                Text(
                  'Smart',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.syne(
                    fontSize: 31,
                    fontWeight: FontWeight.w800,
                    height: 1.05,
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: 2),
                const AuthGradientHeadline(
                  text: 'Rehabilitation',
                  fontSize: 31,
                ),
                const SizedBox(height: 14),
                Text(
                  'Empowering rehabilitation through smart daily follow-up',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    height: 1.6,
                    color: AppColors.lightBlue.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 28),
                const Column(
                  children: [
                    AuthFeaturePill(
                      icon: Icons.psychology_alt_outlined,
                      text: 'AI Progress Tracking',
                    ),
                    SizedBox(height: 10),
                    AuthFeaturePill(
                      icon: Icons.monitor_heart_outlined,
                      text: 'Smart Exercise Guidance',
                    ),
                    SizedBox(height: 10),
                    AuthFeaturePill(
                      icon: Icons.mic_none_rounded,
                      text: 'Speech & Motion Analysis',
                    ),
                  ],
                ),
                const Spacer(flex: 3),
                AuthGradientButton(
                  label: 'Get Started',
                  trailingIcon: Icons.chevron_right_rounded,
                  onPressed: () => context.go(AppRoutes.login),
                ),
                const SizedBox(height: 14),
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
