import 'package:flutter/material.dart';

/// Medical admin palette — used only in Admin Dashboard UI.
class AdminDashboardColors {
  AdminDashboardColors._();

  static const Color background = Color(0xFFF8FAFC);
  static const Color appBar = Color(0xFF1E3A8A);
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryHover = Color(0xFF1D4ED8);
  static const Color accent = Color(0xFF3B82F6);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color emerald = Color(0xFF10B981);
  static const Color orange = Color(0xFFF97316);
  static const Color inactive = Color(0xFF94A3B8);

  static const Color blueSoft = Color(0xFFEFF6FF);
  static const Color emeraldSoft = Color(0xFFECFDF5);
  static const Color orangeSoft = Color(0xFFFFF7ED);
  static const Color redSoft = Color(0xFFFEF2F2);
  static const Color slateSoft = Color(0xFFF1F5F9);
}

class AdminDecorations {
  AdminDecorations._();

  static BorderRadius get cardRadius => BorderRadius.circular(16);

  static List<BoxShadow> cardShadow([Color? tint]) => [
        BoxShadow(
          color: (tint ?? AdminDashboardColors.primary).withValues(alpha: 0.06),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.04),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];
}
