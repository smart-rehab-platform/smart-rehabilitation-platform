import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../constants/admin_dashboard_colors.dart';

class AdminDashboardTheme {
  AdminDashboardTheme._();

  static ThemeData get light {
    const colorScheme = ColorScheme.light(
      primary: AdminDashboardColors.primary,
      onPrimary: Colors.white,
      secondary: AdminDashboardColors.accent,
      onSecondary: Colors.white,
      surface: AdminDashboardColors.surface,
      onSurface: AdminDashboardColors.textPrimary,
      onSurfaceVariant: AdminDashboardColors.textSecondary,
      outline: AdminDashboardColors.border,
      error: AdminDashboardColors.danger,
    );

    final textTheme = GoogleFonts.interTextTheme(
      ThemeData.light().textTheme,
    ).apply(
      bodyColor: AdminDashboardColors.textSecondary,
      displayColor: AdminDashboardColors.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AdminDashboardColors.background,
      textTheme: textTheme,
      dividerColor: AdminDashboardColors.border,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: AdminDashboardColors.appBar,
        foregroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.white),
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        color: AdminDashboardColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: AdminDecorations.cardRadius,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AdminDashboardColors.primary,
          foregroundColor: Colors.white,
          elevation: 2,
          shadowColor: AdminDashboardColors.primary.withValues(alpha: 0.25),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AdminDashboardColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AdminDashboardColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AdminDashboardColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AdminDashboardColors.primary, width: 1.5),
        ),
        hintStyle: GoogleFonts.inter(color: AdminDashboardColors.textMuted),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AdminDashboardColors.primary,
        linearTrackColor: AdminDashboardColors.border,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AdminDashboardColors.slateSoft,
        selectedColor: AdminDashboardColors.blueSoft,
        labelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w600,
          color: AdminDashboardColors.textSecondary,
        ),
        secondaryLabelStyle: GoogleFonts.inter(
          fontWeight: FontWeight.w700,
          color: AdminDashboardColors.primary,
        ),
        side: const BorderSide(color: AdminDashboardColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
    );
  }
}
