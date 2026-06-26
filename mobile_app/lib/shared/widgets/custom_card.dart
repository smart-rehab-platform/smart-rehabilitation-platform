import 'package:flutter/material.dart';

import 'responsive_layout.dart';

class CustomCard extends StatelessWidget {
  const CustomCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.margin,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cardTheme = theme.cardTheme;
    final resolvedPadding = padding ??
        EdgeInsets.all(context.spacingUnit);
    final resolvedMargin = margin ??
        EdgeInsets.symmetric(vertical: context.spacingUnit * 0.5);

    final content = Padding(
      padding: resolvedPadding,
      child: child,
    );

    final card = Card(
      color: cardTheme.color ?? theme.colorScheme.primaryContainer,
      elevation: cardTheme.elevation ?? 0,
      margin: resolvedMargin,
      shape: cardTheme.shape,
      clipBehavior: cardTheme.clipBehavior ?? Clip.antiAlias,
      child: onTap == null
          ? content
          : InkWell(
              onTap: onTap,
              child: content,
            ),
    );

    return card;
  }
}
