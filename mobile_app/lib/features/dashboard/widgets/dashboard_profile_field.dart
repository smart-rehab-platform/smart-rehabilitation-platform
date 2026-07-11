import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import 'dashboard_layout.dart';

class DashboardProfileFieldEntry {
  const DashboardProfileFieldEntry({
    required this.label,
    required this.value,
    this.multiline = false,
  });

  final String label;
  final String value;
  final bool multiline;
}

class DashboardProfileField extends StatelessWidget {
  const DashboardProfileField({
    super.key,
    required this.label,
    required this.value,
    this.multiline = false,
  });

  final String label;
  final String value;
  final bool multiline;

  factory DashboardProfileField.fromEntry(DashboardProfileFieldEntry entry) {
    return DashboardProfileField(
      label: entry.label,
      value: entry.value,
      multiline: entry.multiline,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                  height: multiline ? 1.45 : null,
                ),
            softWrap: true,
          ),
        ],
      ),
    );
  }
}

String? nonEmptyProfileValue(String? value) {
  final trimmed = value?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return null;
  }
  return trimmed;
}

String? readOptionalProfileValue(
  Map<String, dynamic> source,
  List<String> keys,
) {
  for (final key in keys) {
    final value = source[key];
    if (value == null) {
      continue;
    }
    final text = nonEmptyProfileValue(value.toString());
    if (text != null) {
      return text;
    }
  }
  return null;
}

String? readNestedOptionalProfileValue(
  Map<String, dynamic> source,
  List<String> nestedKeys,
  List<String> fieldKeys,
) {
  for (final nestedKey in nestedKeys) {
    final nested = source[nestedKey];
    if (nested is Map) {
      final normalized = nested.map(
        (key, value) => MapEntry(key.toString(), value),
      );
      final value = readOptionalProfileValue(normalized, fieldKeys);
      if (value != null) {
        return value;
      }
    }
  }
  return null;
}
