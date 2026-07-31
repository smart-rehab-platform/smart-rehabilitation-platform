import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';

/// Tabler-style outlined icons used by Treatment Journey UI.
abstract final class TreatmentJourneyIcons {
  static const chartAreaLine =
      'assets/icons/treatment_journey/chart_area_line.png';
  static const currentLocation =
      'assets/icons/treatment_journey/current_location.png';
  static const target = 'assets/icons/treatment_journey/target.png';
  static const trendingUp = 'assets/icons/treatment_journey/trending_up.png';
  static const calendarEvent =
      'assets/icons/treatment_journey/calendar_event.png';
}

class TreatmentJourneyIconBadge extends StatelessWidget {
  const TreatmentJourneyIconBadge({
    super.key,
    required this.asset,
    this.size,
  });

  final String asset;
  final double? size;

  @override
  Widget build(BuildContext context) {
    final iconSize = math.max((size ?? context.dashSpacing * 0.85) - 2, 12.0);
    final badgeSize = iconSize + context.dashSpacing * 0.25;

    return Container(
      width: badgeSize,
      height: badgeSize,
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Image.asset(
        asset,
        width: iconSize,
        height: iconSize,
        color: DashboardColors.brandCyan,
        colorBlendMode: BlendMode.srcIn,
      ),
    );
  }
}
