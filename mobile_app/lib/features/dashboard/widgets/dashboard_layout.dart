import 'package:flutter/material.dart';

extension DashboardLayout on BuildContext {
  Size get dashboardSize => MediaQuery.sizeOf(this);

  double get dashSpacing => dashboardSize.width * 0.04;

  EdgeInsets get dashPadding => EdgeInsets.symmetric(
        horizontal: dashboardSize.width * 0.05,
        vertical: dashboardSize.height * 0.015,
      );
}

String dashboardDisplayName(String? value, {String fallback = 'Parent'}) {
  final trimmed = value?.trim() ?? '';
  return trimmed.isNotEmpty ? trimmed : fallback;
}

String dashboardInitials(String? value, {String fallback = 'SR'}) {
  final parts = dashboardDisplayName(value, fallback: fallback)
      .split(RegExp(r'\s+'))
      .where((part) => part.trim().isNotEmpty)
      .toList();

  if (parts.isEmpty) {
    return fallback;
  }

  if (parts.length == 1) {
    return _firstCharacter(parts.first, fallback);
  }

  return '${_firstCharacter(parts.first, fallback)}${_firstCharacter(parts[1], fallback)}'
      .toUpperCase();
}

String dashboardAvatarLetter(String? value, {String fallback = '?'}) {
  final initials = dashboardInitials(value, fallback: fallback);
  if (initials.isEmpty) {
    return fallback.substring(0, 1).toUpperCase();
  }
  return initials.substring(0, 1).toUpperCase();
}

String _firstCharacter(String value, String fallback) {
  final trimmed = value.trim();
  if (trimmed.isEmpty) {
    return fallback.substring(0, 1).toUpperCase();
  }
  return trimmed.characters.first.toUpperCase();
}
