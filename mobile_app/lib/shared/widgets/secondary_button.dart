import 'package:flutter/material.dart';

import 'loading_indicator.dart';
import 'responsive_layout.dart';

class SecondaryButton extends StatelessWidget {
  const SecondaryButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.expand = true,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool expand;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final labelStyle = theme.outlinedButtonTheme.style?.textStyle?.resolve({}) ??
        theme.textTheme.labelLarge;

    final child = isLoading
        ? LoadingIndicator(
            size: context.iconSize,
            strokeWidth: theme.progressIndicatorTheme.strokeWidth ?? 2,
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: context.iconSize),
                SizedBox(width: context.spacingUnit * 0.5),
              ],
              Flexible(
                child: Text(
                  label,
                  style: labelStyle,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          );

    final button = OutlinedButton(
      onPressed: isLoading ? null : onPressed,
      style: theme.outlinedButtonTheme.style?.copyWith(
        minimumSize: WidgetStatePropertyAll(
          Size(expand ? double.infinity : 0, context.controlHeight),
        ),
        padding: WidgetStatePropertyAll(
          EdgeInsets.symmetric(
            horizontal: context.spacingUnit,
            vertical: context.spacingUnit * 0.75,
          ),
        ),
      ),
      child: child,
    );

    if (!expand) {
      return button;
    }

    return SizedBox(
      width: double.infinity,
      child: button,
    );
  }
}
