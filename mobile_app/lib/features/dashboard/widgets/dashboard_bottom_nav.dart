import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';

enum DashboardNavItem { home, patients, exercises, reports, more }

class DashboardBottomNav extends StatelessWidget {
  const DashboardBottomNav({
    super.key,
    this.currentIndex,
    this.onTap,
    this.accentColor = DashboardColors.brandCyan,
  });

  final DashboardNavItem? currentIndex;
  final ValueChanged<DashboardNavItem>? onTap;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        border: Border(
          top: BorderSide(color: DashboardColors.border.withValues(alpha: 0.9)),
        ),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: context.dashSpacing * 0.25,
            vertical: context.dashSpacing * 0.35,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_rounded,
                label: 'Home',
                isActive: currentIndex == DashboardNavItem.home,
                onTap: () => onTap?.call(DashboardNavItem.home),
                accentColor: accentColor,
                theme: theme,
              ),
              _NavItem(
                icon: Icons.people_outline_rounded,
                label: 'Patients',
                isActive: currentIndex == DashboardNavItem.patients,
                onTap: () => onTap?.call(DashboardNavItem.patients),
                accentColor: accentColor,
                theme: theme,
              ),
              _NavItem(
                icon: Icons.fitness_center_outlined,
                label: 'Exercises',
                isActive: currentIndex == DashboardNavItem.exercises,
                onTap: () => onTap?.call(DashboardNavItem.exercises),
                accentColor: accentColor,
                theme: theme,
              ),
              _NavItem(
                icon: Icons.description_outlined,
                label: 'Reports',
                isActive: currentIndex == DashboardNavItem.reports,
                onTap: () => onTap?.call(DashboardNavItem.reports),
                accentColor: accentColor,
                theme: theme,
              ),
              _NavItem(
                icon: Icons.grid_view_rounded,
                label: 'More',
                isActive: currentIndex == DashboardNavItem.more,
                onTap: () => onTap?.call(DashboardNavItem.more),
                accentColor: accentColor,
                theme: theme,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
    required this.accentColor,
    required this.theme,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final Color accentColor;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    final color = isActive ? accentColor : DashboardColors.textMuted;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: context.dashSpacing * 0.25,
          vertical: context.dashSpacing * 0.15,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: context.dashSpacing * 0.55, color: color),
            SizedBox(height: context.dashSpacing * 0.1),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: color,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
