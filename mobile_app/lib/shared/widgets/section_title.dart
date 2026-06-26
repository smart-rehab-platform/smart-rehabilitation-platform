import 'package:flutter/material.dart';

import 'responsive_layout.dart';

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.title,
    this.subtitle,
    this.alignment = CrossAxisAlignment.start,
    this.textAlign = TextAlign.start,
  });

  final String title;
  final String? subtitle;
  final CrossAxisAlignment alignment;
  final TextAlign textAlign;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: alignment,
      children: [
        Text(
          title,
          style: theme.textTheme.titleLarge?.copyWith(
            color: theme.colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
          textAlign: textAlign,
        ),
        if (subtitle != null) ...[
          SizedBox(height: context.spacingUnit * 0.5),
          Text(
            subtitle!,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: textAlign,
          ),
        ],
      ],
    );
  }
}
