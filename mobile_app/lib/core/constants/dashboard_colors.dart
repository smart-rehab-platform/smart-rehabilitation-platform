import 'package:flutter/material.dart';

/// Light dashboard palette aligned with the reference UI while keeping
/// Smart Rehab's Inter typography and soft-card design language from auth.
class DashboardColors {
  DashboardColors._();

  /// Smart Rehabilitation brand palette.
  static const Color brandNavy = Color(0xFF123458);
  static const Color brandCyan = Color(0xFF2AA4C9);
  static const Color brandSecondaryBlue = Color(0xFF56B6E9);
  static const Color brandLightBlue = Color(0xFF8FD3FF);
  static const Color brandSoft = Color(0xFFE8F6FC);
  static const Color brandHeroBackground = Color(0xFFF2F9FC);

  /// Shared dashboard accent — aligned with brand cyan.
  static const Color primary = brandCyan;
  static const Color accent = Color(0xFF00CEC9);
  static const Color background = Color(0xFFF6F7FB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE8ECF4);
  /// Legacy name — same value as [brandSoft].
  static const Color purpleSoft = brandSoft;
  static const Color tealSoft = Color(0xFFE6FFFC);
  static const Color blueSoft = Color(0xFFEFF6FF);
  static const Color amberSoft = Color(0xFFFFF7ED);
  static const Color summaryTasksBackground = Color(0xFFF2FBF6);
  static const Color summarySessionsBackground = Color(0xFFF2F8FF);
  static const Color heroCardBackground = brandHeroBackground;
  static const Color highPriority = Color(0xFFEF4444);
  static const Color mediumPriority = Color(0xFFF59E0B);
  static const Color lowPriority = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color success = Color(0xFF22C55E);

  /// Same gradient as auth primary buttons (Get Started / Sign In).
  static const LinearGradient brandPrimaryGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [Color(0xFF2398BD), Color(0xFF56B6E9)],
  );

  /// Progress bar gradient family.
  static const LinearGradient brandProgressGradient = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [Color(0xFF2AA4C9), Color(0xFF56B6E9)],
  );
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

  /// Soft premium surface for the Parent dashboard hero card.
  static BoxDecoration heroCardDecoration({
    Color tint = DashboardColors.brandCyan,
  }) => BoxDecoration(
    color: DashboardColors.heroCardBackground,
    borderRadius: cardRadius,
    border: Border.all(color: DashboardColors.border.withValues(alpha: 0.55)),
    boxShadow: heroCardShadow(tint),
  );

  static List<BoxShadow> heroCardShadow(Color tint) => [
    BoxShadow(
      color: tint.withValues(alpha: 0.06),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.03),
      blurRadius: 10,
      offset: const Offset(0, 2),
    ),
  ];
}
