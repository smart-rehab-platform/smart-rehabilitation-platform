import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';
class DashboardSurfaceCard extends StatelessWidget {
  const DashboardSurfaceCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.onLongPress,
    this.tint = DashboardColors.primary,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color tint;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: padding ?? EdgeInsets.all(context.dashSpacing * 0.9),
      child: child,
    );

    final card = DecoratedBox(
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: DashboardDecorations.cardRadius,
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.7)),
        boxShadow: DashboardDecorations.cardShadow(tint),
      ),
      child: onTap == null && onLongPress == null
          ? content
          : Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                onLongPress: onLongPress,
                borderRadius: DashboardDecorations.cardRadius,
                child: content,
              ),
            ),
    );

    return card;
  }
}
