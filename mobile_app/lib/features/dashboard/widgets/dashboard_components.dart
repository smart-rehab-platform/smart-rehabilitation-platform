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
    this.backgroundColor,
    this.circularIcon = false,
    this.onTap,
    this.valueMaxLines = 1,
    this.valueStyle,
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final iconSize = context.dashSpacing * 0.55;

    Widget iconWidget = Icon(
      icon,
      size: iconSize,
      color: iconColor,
    );

    if (circularIcon) {
      iconWidget = Container(
        width: iconSize * 2.35,
        height: iconSize * 2.35,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: iconBackground,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: iconSize,
          color: iconColor,
        ),
      );
    } else {
      iconWidget = Container(
        padding: EdgeInsets.all(context.dashSpacing * 0.45),
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
            border: Border.all(
              color: iconBackground.withValues(alpha: 0.65),
            ),
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
      style: valueStyle ??
          theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
            color: DashboardColors.textPrimary,
            height: 1.2,
          ),
    );

    final labelText = Text(
      label,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      style: theme.textTheme.bodySmall?.copyWith(
        color: DashboardColors.textSecondary,
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
              SizedBox(height: context.dashSpacing * 0.25),
              labelText,
            ],
          )
        : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              iconWidget,
              SizedBox(height: context.dashSpacing * 0.65),
              valueText,
              SizedBox(height: context.dashSpacing * 0.15),
              labelText,
            ],
          );

    return DashboardSurfaceCard(
      onTap: onTap,
      padding: EdgeInsets.all(context.dashSpacing * 0.75),
      backgroundColor: backgroundColor ?? DashboardColors.surface,
      tint: iconColor,
      decoration: cardDecoration,
      child: cardContent,
    );
  }
}

class DashboardSummaryGrid extends StatelessWidget {
  const DashboardSummaryGrid({
    super.key,
    required this.cards,
    this.childAspectRatio = 1.35,
  });

  final List<DashboardSummaryCard> cards;
  final double childAspectRatio;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: context.dashSpacing * 0.75,
      crossAxisSpacing: context.dashSpacing * 0.75,
      childAspectRatio: childAspectRatio,
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
    this.linkColor = DashboardColors.brandCyan,
  });

  final String title;
  final String actionLabel;
  final VoidCallback? onActionTap;
  final Color linkColor;

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
            foregroundColor: linkColor,
            padding: EdgeInsets.symmetric(horizontal: context.dashSpacing * 0.25),
          ),
          child: Text(
            actionLabel,
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
                        color: DashboardColors.brandCyan.withValues(alpha: 0.11),
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
  State<BrandGradientIconButton> createState() => _BrandGradientIconButtonState();
}

class _BrandGradientIconButtonState extends State<BrandGradientIconButton> {
  static const _pressDuration = Duration(milliseconds: 135);
  bool _pressed = false;

  bool get _isEnabled => widget.enabled && widget.onPressed != null && !widget.isLoading;

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
                        color: DashboardColors.brandCyan.withValues(alpha: 0.11),
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
