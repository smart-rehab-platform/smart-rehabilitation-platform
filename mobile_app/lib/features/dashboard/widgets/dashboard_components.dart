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
    this.valueMaxLines = 1,
    this.valueStyle,
    this.subtitle,
    this.labelMaxLines = 1,
    this.compact = false,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color iconBackground;
  final Color iconColor;
  final VoidCallback? onTap;
  final int valueMaxLines;
  final TextStyle? valueStyle;
  final String? subtitle;
  final int labelMaxLines;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final spacing = context.dashSpacing;

    if (compact) {
      return _buildCompactHorizontalCard(context, theme, spacing);
    }

    return _buildStandardCard(context, theme, spacing);
  }

  Widget _buildStandardCard(
    BuildContext context,
    ThemeData theme,
    double spacing,
  ) {
    final cardPadding = spacing * 0.75;
    final iconPadding = spacing * 0.45;
    final iconSize = spacing * 0.55;
    final gapAfterIcon = spacing * 0.65;
    final gapAfterValue = spacing * 0.15;
    final gapAfterLabel = spacing * 0.15;

    return DashboardSurfaceCard(
      onTap: onTap,
      padding: EdgeInsets.all(cardPadding),
      child: Align(
        alignment: Alignment.topLeft,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildIconBadge(iconPadding: iconPadding, iconSize: iconSize),
            SizedBox(height: gapAfterIcon),
            ..._buildTextBlock(
              theme: theme,
              valueHeight: 1.2,
              labelHeight: 1.25,
              gapAfterValue: gapAfterValue,
              gapAfterLabel: gapAfterLabel,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactHorizontalCard(
    BuildContext context,
    ThemeData theme,
    double spacing,
  ) {
    const iconTextGap = 10.0;
    final cardPadding = spacing * 0.55;
    final iconPadding = spacing * 0.64;
    final iconSize = spacing * 1.1;
    final gapAfterValue = spacing * 0.08;
    final gapAfterLabel = spacing * 0.08;
    final baseValueFontSize = theme.textTheme.titleLarge?.fontSize ?? 22;
    final compactValueStyle = theme.textTheme.titleLarge?.copyWith(
      fontWeight: FontWeight.w800,
      color: DashboardColors.textPrimary,
      height: 1.1,
      fontSize: baseValueFontSize * 1.1,
    );

    return DashboardSurfaceCard(
      onTap: onTap,
      expand: true,
      padding: EdgeInsets.all(cardPadding),
      child: Center(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _buildIconBadge(iconPadding: iconPadding, iconSize: iconSize),
            const SizedBox(width: iconTextGap),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: _buildTextBlock(
                  theme: theme,
                  valueHeight: 1.1,
                  labelHeight: 1.2,
                  gapAfterValue: gapAfterValue,
                  gapAfterLabel: gapAfterLabel,
                  valueTextStyle: compactValueStyle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconBadge({
    required double iconPadding,
    required double iconSize,
  }) {
    return Container(
      padding: EdgeInsets.all(iconPadding),
      decoration: BoxDecoration(
        color: iconBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(icon, size: iconSize, color: iconColor),
    );
  }

  List<Widget> _buildTextBlock({
    required ThemeData theme,
    required double valueHeight,
    required double labelHeight,
    required double gapAfterValue,
    required double gapAfterLabel,
    TextStyle? valueTextStyle,
  }) {
    return [
      Text(
        value,
        maxLines: valueMaxLines,
        overflow: TextOverflow.ellipsis,
        style:
            valueTextStyle ??
            valueStyle ??
            theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
              height: valueHeight,
            ),
      ),
      SizedBox(height: gapAfterValue),
      Text(
        label,
        maxLines: labelMaxLines,
        overflow: TextOverflow.ellipsis,
        style: theme.textTheme.bodySmall?.copyWith(
          color: DashboardColors.textSecondary,
          fontWeight: FontWeight.w500,
          height: labelHeight,
        ),
      ),
      if (subtitle != null) ...[
        SizedBox(height: gapAfterLabel),
        Text(
          subtitle!,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.labelSmall?.copyWith(
            color: DashboardColors.textMuted,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    ];
  }
}

class DashboardSummaryGrid extends StatelessWidget {
  const DashboardSummaryGrid({
    super.key,
    required this.cards,
    this.childAspectRatio = 1.35,
    this.compact = false,
  });

  final List<DashboardSummaryCard> cards;
  final double childAspectRatio;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final gridSpacing = context.dashSpacing * (compact ? 0.55 : 0.75);
    final horizontalInset = compact ? context.dashSpacing * 0.45 : 0.0;

    final grid = GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: gridSpacing,
      crossAxisSpacing: gridSpacing,
      childAspectRatio: childAspectRatio,
      children: cards,
    );

    if (horizontalInset <= 0) {
      return grid;
    }

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: horizontalInset),
      child: grid,
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
            padding: EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.25,
            ),
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
