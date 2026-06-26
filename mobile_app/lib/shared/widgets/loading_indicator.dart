import 'package:flutter/material.dart';

import 'responsive_layout.dart';

class LoadingIndicator extends StatelessWidget {
  const LoadingIndicator({
    super.key,
    this.size,
    this.strokeWidth,
    this.color,
  });

  final double? size;
  final double? strokeWidth;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resolvedStrokeWidth =
        strokeWidth ?? theme.progressIndicatorTheme.strokeWidth ?? 2;

    return LayoutBuilder(
      builder: (context, constraints) {
        final dimension = size ??
            (constraints.maxWidth.isFinite
                ? constraints.maxWidth * 0.12
                : context.iconSize);

        return SizedBox(
          width: dimension,
          height: dimension,
          child: CircularProgressIndicator(
            strokeWidth: resolvedStrokeWidth,
            color: color ?? theme.colorScheme.primary,
          ),
        );
      },
    );
  }
}
