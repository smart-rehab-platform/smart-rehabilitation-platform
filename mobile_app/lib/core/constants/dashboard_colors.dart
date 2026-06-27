import 'package:flutter/material.dart';

/// Light dashboard palette aligned with the reference UI while keeping
/// Smart Rehab's Inter typography and soft-card design language from auth.
class DashboardColors {
  DashboardColors._();

  static const Color primary = Color(0xFF6C5CE7);
  static const Color accent = Color(0xFF00CEC9);
  static const Color background = Color(0xFFF6F7FB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE8ECF4);
  static const Color purpleSoft = Color(0xFFF0EDFF);
  static const Color tealSoft = Color(0xFFE6FFFC);
  static const Color blueSoft = Color(0xFFEFF6FF);
  static const Color amberSoft = Color(0xFFFFF7ED);
  static const Color highPriority = Color(0xFFEF4444);
  static const Color mediumPriority = Color(0xFFF59E0B);
  static const Color lowPriority = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color success = Color(0xFF22C55E);
}

class DashboardDecorations {
  DashboardDecorations._();

  static BorderRadius get cardRadius => BorderRadius.circular(16);

  static List<BoxShadow> cardShadow(Color tint) => [
        BoxShadow(
          color: tint.withValues(alpha: 0.08),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.04),
          blurRadius: 10,
          offset: const Offset(0, 2),
        ),
      ];
}
