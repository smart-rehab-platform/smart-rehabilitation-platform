import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../constants/dashboard_colors.dart';

class DashboardTheme {
  DashboardTheme._();

  static ThemeData get light {
    const colorScheme = ColorScheme.light(
      primary: DashboardColors.primary,
      onPrimary: Colors.white,
      secondary: DashboardColors.accent,
      onSecondary: DashboardColors.textPrimary,
      surface: DashboardColors.surface,
      onSurface: DashboardColors.textPrimary,
      onSurfaceVariant: DashboardColors.textSecondary,
      outline: DashboardColors.border,
      error: DashboardColors.highPriority,
    );

    final textTheme = GoogleFonts.interTextTheme(
      ThemeData.light().textTheme,
    ).apply(
      bodyColor: DashboardColors.textSecondary,
      displayColor: DashboardColors.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: DashboardColors.background,
      textTheme: textTheme,
      dividerColor: DashboardColors.border,
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: DashboardColors.background,
        foregroundColor: DashboardColors.textPrimary,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: DashboardColors.textPrimary,
        ),
      ),
      cardTheme: CardThemeData(
        color: DashboardColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: DashboardDecorations.cardRadius,
        ),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: DashboardColors.accent,
        linearTrackColor: DashboardColors.border,
      ),
    );
  }
}
