import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/utils/api_response_parser.dart';

/// Reads exercise category from API payloads (matches web `mapExerciseItem`).
String? readExerciseCategory(Map<String, dynamic> map) {
  final direct = ApiResponseParser.readString(map, const [
    'category_name',
    'categoryName',
    'category',
  ]);
  if (direct != null && direct.trim().isNotEmpty) {
    return direct.trim();
  }

  final nested = map['category'];
  if (nested is Map) {
    final name = ApiResponseParser.readString(
      nested.map((key, value) => MapEntry(key.toString(), value)),
      const ['name', 'title'],
    );
    if (name != null && name.trim().isNotEmpty) {
      return name.trim();
    }
  }

  return null;
}

String _normalizeExerciseCategory(String? category) {
  return category?.trim().toLowerCase() ?? '';
}

/// Category-based icon mapping aligned with web `getExerciseCategoryIconType`.
IconData exerciseCategoryIcon(String? category) {
  final normalized = _normalizeExerciseCategory(category);
  if (normalized.contains('articulation') ||
      normalized.contains('speech') ||
      normalized.contains('voice') ||
      normalized.contains('fluency')) {
    return Icons.mic_rounded;
  }
  if (normalized.contains('language') || normalized.contains('learning')) {
    return Icons.menu_book_rounded;
  }
  if (normalized.contains('fine motor') ||
      normalized.contains('daily living') ||
      normalized.contains('sensory')) {
    return Icons.back_hand_rounded;
  }
  if (normalized.contains('gross motor') ||
      normalized.contains('motor rehabilitation')) {
    return Icons.directions_walk_rounded;
  }
  if (normalized.contains('behavioral') ||
      normalized.contains('social') ||
      normalized.contains('autism') ||
      normalized.contains('developmental')) {
    return Icons.groups_rounded;
  }
  return Icons.fitness_center_rounded;
}

/// Category tone colors aligned with web `getExerciseCategoryTone`.
Color exerciseCategoryIconColor(String? category) {
  final normalized = _normalizeExerciseCategory(category);
  if (normalized.contains('articulation') ||
      normalized.contains('speech') ||
      normalized.contains('voice')) {
    return DashboardColors.brandCyan;
  }
  if (normalized.contains('fluency')) {
    return DashboardColors.accent;
  }
  if (normalized.contains('language') || normalized.contains('learning')) {
    return const Color(0xFF3B82F6);
  }
  if (normalized.contains('motor') ||
      normalized.contains('sensory') ||
      normalized.contains('daily')) {
    return const Color(0xFF0D9488);
  }
  if (normalized.contains('behavioral') ||
      normalized.contains('social') ||
      normalized.contains('autism') ||
      normalized.contains('developmental')) {
    return DashboardColors.brandSecondaryBlue;
  }
  return DashboardColors.warning;
}

Color exerciseCategoryIconBackground(String? category) {
  final normalized = _normalizeExerciseCategory(category);
  if (normalized.contains('articulation') ||
      normalized.contains('speech') ||
      normalized.contains('voice')) {
    return DashboardColors.brandSoft;
  }
  if (normalized.contains('fluency')) {
    return DashboardColors.tealSoft;
  }
  if (normalized.contains('language') || normalized.contains('learning')) {
    return DashboardColors.blueSoft;
  }
  if (normalized.contains('motor') ||
      normalized.contains('sensory') ||
      normalized.contains('daily')) {
    return DashboardColors.tealSoft;
  }
  if (normalized.contains('behavioral') ||
      normalized.contains('social') ||
      normalized.contains('autism') ||
      normalized.contains('developmental')) {
    return DashboardColors.brandSoft;
  }
  return DashboardColors.amberSoft;
}
