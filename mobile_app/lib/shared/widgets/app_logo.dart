import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import 'responsive_layout.dart';

class AppLogo extends StatelessWidget {
  const AppLogo({
    super.key,
    this.size,
    this.showBorder = true,
  });

  final double? size;
  final bool showBorder;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final resolvedSize = size ?? context.logoSize;

    return LayoutBuilder(
      builder: (context, constraints) {
        final dimension = size ??
            (constraints.maxWidth.isFinite
                ? constraints.maxWidth * 0.35
                : context.logoSize);

        return Semantics(
          label: 'Smart Rehabilitation logo',
          child: Container(
            width: dimension,
            height: dimension,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: theme.colorScheme.primaryContainer,
              border: showBorder
                  ? Border.all(
                      color: theme.colorScheme.primary,
                      width: resolvedSize * 0.025,
                    )
                  : null,
              boxShadow: [
                BoxShadow(
                  color: AppColors.mediumBlue.withValues(alpha: 0.2),
                  blurRadius: resolvedSize * 0.12,
                  spreadRadius: resolvedSize * 0.01,
                ),
              ],
            ),
            child: Icon(
              Icons.health_and_safety_outlined,
              size: dimension * 0.45,
              color: theme.colorScheme.onPrimaryContainer,
            ),
          ),
        );
      },
    );
  }
}
