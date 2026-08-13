import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../l10n/app_localizations.dart';
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
    this.backgroundColor,
    this.circularIcon = false,
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
  final Color? backgroundColor;
  final bool circularIcon;
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

    final iconSize = spacing * 0.55;

    Widget iconWidget = Icon(icon, size: iconSize, color: iconColor);

    if (circularIcon) {
      iconWidget = Container(
        width: iconSize * 2.35,
        height: iconSize * 2.35,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: iconBackground,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: iconSize, color: iconColor),
      );
    } else {
      iconWidget = Container(
        padding: EdgeInsets.all(spacing * 0.45),
        decoration: BoxDecoration(
          color: iconBackground,
          borderRadius: BorderRadius.circular(12),
        ),
        child: iconWidget,
      );
    }

    final cardDecoration = backgroundColor != null
        ? BoxDecoration(
            color: backgroundColor,
            borderRadius: DashboardDecorations.cardRadius,
            border: Border.all(color: iconBackground.withValues(alpha: 0.65)),
            boxShadow: [
              BoxShadow(
                color: iconColor.withValues(alpha: 0.08),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          )
        : null;

    final valueText = Text(
      value,
      maxLines: valueMaxLines,
      overflow: TextOverflow.ellipsis,
      style:
          valueStyle ??
          theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
            color: DashboardColors.textPrimary,
            height: 1.2,
          ),
    );

    final labelText = Text(
      label,
      maxLines: labelMaxLines,
      overflow: TextOverflow.ellipsis,
      style: theme.textTheme.bodySmall?.copyWith(
        color: DashboardColors.textSecondary,
        fontWeight: FontWeight.w500,
      ),
    );

    final subtitleWidget = subtitle == null
        ? null
        : Text(
            subtitle!,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              fontWeight: FontWeight.w500,
            ),
          );

    final cardContent = circularIcon
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  iconWidget,
                  const SizedBox(width: 14),
                  Expanded(child: valueText),
                ],
              ),
              SizedBox(height: spacing * 0.25),
              labelText,
              if (subtitleWidget != null) ...[
                SizedBox(height: spacing * 0.15),
                subtitleWidget,
              ],
            ],
          )
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              iconWidget,
              SizedBox(height: spacing * 0.65),
              valueText,
              SizedBox(height: spacing * 0.15),
              labelText,
              if (subtitleWidget != null) ...[
                SizedBox(height: spacing * 0.15),
                subtitleWidget,
              ],
            ],
          );

    return DashboardSurfaceCard(
      onTap: onTap,
      padding: EdgeInsets.all(spacing * 0.75),
      backgroundColor: backgroundColor ?? DashboardColors.surface,
      tint: iconColor,
      decoration: cardDecoration,
      child: cardContent,
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
    this.actionLabel,
    this.onActionTap,
    this.linkColor = DashboardColors.brandCyan,
  });

  final String title;
  final String? actionLabel;
  final VoidCallback? onActionTap;
  final Color linkColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final resolvedActionLabel = actionLabel ?? l10n.commonSeeAll;

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
            foregroundColor: linkColor,
            padding: EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.25,
            ),
          ),
          child: Text(
            resolvedActionLabel,
            style: theme.textTheme.labelLarge?.copyWith(
              color: linkColor,
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

class BrandGradientButton extends StatefulWidget {
  const BrandGradientButton({
    super.key,
    required this.onPressed,
    required this.label,
    this.icon,
    this.isLoading = false,
    this.verticalPadding,
  });

  final VoidCallback? onPressed;
  final String label;
  final IconData? icon;
  final bool isLoading;
  final double? verticalPadding;

  @override
  State<BrandGradientButton> createState() => _BrandGradientButtonState();
}

class _BrandGradientButtonState extends State<BrandGradientButton> {
  static const _pressDuration = Duration(milliseconds: 135);
  bool _pressed = false;

  bool get _isEnabled => widget.onPressed != null && !widget.isLoading;

  void _setPressed(bool value) {
    if (_pressed == value) {
      return;
    }
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final padding = widget.verticalPadding ?? context.dashSpacing * 0.75;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: _isEnabled ? (_) => _setPressed(true) : null,
      onTapUp: _isEnabled ? (_) => _setPressed(false) : null,
      onTapCancel: _isEnabled ? () => _setPressed(false) : null,
      onTap: _isEnabled ? widget.onPressed : null,
      child: AnimatedScale(
        scale: _pressed && _isEnabled ? 0.975 : 1,
        duration: _pressDuration,
        curve: Curves.easeInOut,
        child: AnimatedContainer(
          duration: _pressDuration,
          curve: Curves.easeInOut,
          decoration: BoxDecoration(
            gradient: _isEnabled
                ? DashboardColors.brandPrimaryGradient
                : LinearGradient(
                    colors: [
                      DashboardColors.brandCyan.withValues(alpha: 0.45),
                      DashboardColors.brandSecondaryBlue.withValues(alpha: 0.4),
                    ],
                  ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: _isEnabled
                ? [
                    BoxShadow(
                      color: DashboardColors.brandCyan.withValues(alpha: 0.22),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                    if (_pressed)
                      BoxShadow(
                        color: DashboardColors.brandCyan.withValues(
                          alpha: 0.11,
                        ),
                        blurRadius: 22,
                        spreadRadius: 1,
                      ),
                  ]
                : null,
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: padding, horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.isLoading) ...[
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  ),
                  const SizedBox(width: 8),
                ] else if (widget.icon != null) ...[
                  Icon(widget.icon, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                ],
                Text(
                  widget.label,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class BrandGradientIconButton extends StatefulWidget {
  const BrandGradientIconButton({
    super.key,
    required this.onPressed,
    required this.icon,
    this.isLoading = false,
    this.enabled = true,
    this.size = 48,
  });

  final VoidCallback? onPressed;
  final IconData icon;
  final bool isLoading;
  final bool enabled;
  final double size;

  @override
  State<BrandGradientIconButton> createState() =>
      _BrandGradientIconButtonState();
}

class _BrandGradientIconButtonState extends State<BrandGradientIconButton> {
  static const _pressDuration = Duration(milliseconds: 135);
  bool _pressed = false;

  bool get _isEnabled =>
      widget.enabled && widget.onPressed != null && !widget.isLoading;

  void _setPressed(bool value) {
    if (_pressed == value) {
      return;
    }
    setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: _isEnabled ? (_) => _setPressed(true) : null,
      onTapUp: _isEnabled ? (_) => _setPressed(false) : null,
      onTapCancel: _isEnabled ? () => _setPressed(false) : null,
      onTap: _isEnabled ? widget.onPressed : null,
      child: AnimatedScale(
        scale: _pressed && _isEnabled ? 0.975 : 1,
        duration: _pressDuration,
        curve: Curves.easeInOut,
        child: AnimatedContainer(
          duration: _pressDuration,
          curve: Curves.easeInOut,
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            gradient: _isEnabled ? DashboardColors.brandPrimaryGradient : null,
            color: _isEnabled
                ? null
                : DashboardColors.brandCyan.withValues(alpha: 0.35),
            shape: BoxShape.circle,
            boxShadow: _isEnabled
                ? [
                    BoxShadow(
                      color: DashboardColors.brandCyan.withValues(alpha: 0.22),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                    if (_pressed)
                      BoxShadow(
                        color: DashboardColors.brandCyan.withValues(
                          alpha: 0.11,
                        ),
                        blurRadius: 22,
                        spreadRadius: 1,
                      ),
                  ]
                : null,
          ),
          child: Center(
            child: widget.isLoading
                ? SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  )
                : Icon(widget.icon, color: Colors.white),
          ),
        ),
      ),
    );
  }
}

ButtonStyle brandOutlinedButtonStyle({BorderRadius? borderRadius}) {
  return OutlinedButton.styleFrom(
    foregroundColor: DashboardColors.brandCyan,
    side: const BorderSide(color: DashboardColors.brandCyan),
    shape: RoundedRectangleBorder(
      borderRadius: borderRadius ?? BorderRadius.circular(14),
    ),
  );
}
