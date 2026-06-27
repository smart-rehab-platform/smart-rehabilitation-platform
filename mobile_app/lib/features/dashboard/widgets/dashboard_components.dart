import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';
import 'dashboard_surface_card.dart';

class DashboardSummaryCard extends StatelessWidget {
  const DashboardSummaryCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.iconBackground,
    required this.iconColor,
    this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color iconBackground;
  final Color iconColor;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      onTap: onTap,
      padding: EdgeInsets.all(context.dashSpacing * 0.75),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(context.dashSpacing * 0.45),
            decoration: BoxDecoration(
              color: iconBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              size: context.dashSpacing * 0.55,
              color: iconColor,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class DashboardSummaryGrid extends StatelessWidget {
  const DashboardSummaryGrid({super.key, required this.cards});

  final List<DashboardSummaryCard> cards;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: context.dashSpacing * 0.75,
      crossAxisSpacing: context.dashSpacing * 0.75,
      childAspectRatio: 1.35,
      children: cards,
    );
  }
}

class DashboardSectionHeader extends StatelessWidget {
  const DashboardSectionHeader({
    super.key,
    required this.title,
    this.actionLabel = 'See all',
    this.onActionTap,
  });

  final String title;
  final String actionLabel;
  final VoidCallback? onActionTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
        ),
        TextButton(
          onPressed: onActionTap ?? () {},
          style: TextButton.styleFrom(
            foregroundColor: DashboardColors.primary,
            padding: EdgeInsets.symmetric(horizontal: context.dashSpacing * 0.25),
          ),
          child: Text(
            actionLabel,
            style: theme.textTheme.labelLarge?.copyWith(
              color: DashboardColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class DashboardGreeting extends StatelessWidget {
  const DashboardGreeting({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Text(
      message,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
            height: 1.35,
          ),
    );
  }
}
