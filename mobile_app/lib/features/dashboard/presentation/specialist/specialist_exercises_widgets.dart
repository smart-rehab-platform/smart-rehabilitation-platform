import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_feature_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'manage_goals_widgets.dart';

const specialistExerciseAllCategoryLabel = 'All';

const _knownCategoryOrder = [
  'Speech Articulation',
  'Fluency',
  'Language',
];

const _allCategoriesLabel = specialistExerciseAllCategoryLabel;

List<String> buildExerciseCategoryFilters(List<SpecialistExerciseItem> items) {
  final fromApi = <String>{};
  for (final item in items) {
    final category = item.category?.trim();
    if (category != null && category.isNotEmpty) {
      fromApi.add(category);
    }
  }

  final ordered = <String>[_allCategoriesLabel];
  for (final known in _knownCategoryOrder) {
    if (fromApi.remove(known)) {
      ordered.add(known);
    }
  }

  final remaining = fromApi.toList()..sort();
  ordered.addAll(remaining);
  return ordered;
}

List<SpecialistExerciseItem> filterExercises(
  List<SpecialistExerciseItem> items, {
  required String searchQuery,
  required String selectedCategory,
}) {
  final query = searchQuery.trim().toLowerCase();

  return items.where((exercise) {
    if (selectedCategory != _allCategoriesLabel) {
      final category = exercise.category?.trim() ?? '';
      if (category != selectedCategory) {
        return false;
      }
    }

    if (query.isEmpty) {
      return true;
    }

    final searchable = [
      exercise.title,
      exercise.category,
      exercise.instructions,
    ].whereType<String>().join(' ').toLowerCase();

    return searchable.contains(query);
  }).toList();
}

IconData exerciseCategoryIcon(String? category) {
  final normalized = category?.trim().toLowerCase() ?? '';
  if (normalized.contains('articulation') || normalized.contains('speech')) {
    return Icons.record_voice_over_rounded;
  }
  if (normalized.contains('fluency')) {
    return Icons.graphic_eq_rounded;
  }
  if (normalized.contains('language')) {
    return Icons.menu_book_rounded;
  }
  return Icons.fitness_center_rounded;
}

Color exerciseCategoryIconColor(String? category) {
  final normalized = category?.trim().toLowerCase() ?? '';
  if (normalized.contains('articulation') || normalized.contains('speech')) {
    return DashboardColors.primary;
  }
  if (normalized.contains('fluency')) {
    return DashboardColors.accent;
  }
  if (normalized.contains('language')) {
    return const Color(0xFF3B82F6);
  }
  return DashboardColors.warning;
}

Color exerciseCategoryIconBackground(String? category) {
  final normalized = category?.trim().toLowerCase() ?? '';
  if (normalized.contains('articulation') || normalized.contains('speech')) {
    return DashboardColors.purpleSoft;
  }
  if (normalized.contains('fluency')) {
    return DashboardColors.tealSoft;
  }
  if (normalized.contains('language')) {
    return DashboardColors.blueSoft;
  }
  return DashboardColors.amberSoft;
}

Widget buildExerciseSearchField({
  required TextEditingController controller,
  required ValueChanged<String> onChanged,
}) {
  return TextField(
    controller: controller,
    onChanged: onChanged,
    textInputAction: TextInputAction.search,
    decoration: goalFieldDecoration(
      'Search by title, category, or instructions',
    ).copyWith(
      prefixIcon: const Icon(
        Icons.search_rounded,
        color: DashboardColors.textMuted,
      ),
    ),
  );
}

class SpecialistExerciseCategoryChips extends StatelessWidget {
  const SpecialistExerciseCategoryChips({
    super.key,
    required this.categories,
    required this.selected,
    required this.onChanged,
  });

  final List<String> categories;
  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: context.dashSpacing * 2.1,
      child: ListView.separated(
        primary: false,
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: categories.length,
        separatorBuilder: (_, __) => SizedBox(width: context.dashSpacing * 0.4),
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = selected == category;

          return InkWell(
            onTap: () => onChanged(category),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: context.dashSpacing * 0.65,
                vertical: context.dashSpacing * 0.45,
              ),
              decoration: BoxDecoration(
                color: isSelected
                    ? DashboardColors.purpleSoft
                    : DashboardColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected
                      ? DashboardColors.primary
                      : DashboardColors.border,
                ),
              ),
              child: Text(
                category,
                maxLines: 1,
                softWrap: false,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: isSelected
                          ? DashboardColors.primary
                          : DashboardColors.textSecondary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class SpecialistExerciseCategoryBadge extends StatelessWidget {
  const SpecialistExerciseCategoryBadge({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final color = exerciseCategoryIconColor(label);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.45,
        vertical: context.dashSpacing * 0.15,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class SpecialistExerciseCard extends StatelessWidget {
  const SpecialistExerciseCard({
    super.key,
    required this.exercise,
    this.showMediaIndicator = false,
  });

  final SpecialistExerciseItem exercise;
  final bool showMediaIndicator;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final category = exercise.category?.trim();
    final summary = exercise.instructions?.trim();
    final iconColor = exerciseCategoryIconColor(category);
    final iconBackground = exerciseCategoryIconBackground(category);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        tint: iconColor,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: context.dashSpacing * 2.4,
              height: context.dashSpacing * 2.4,
              decoration: BoxDecoration(
                color: iconBackground,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                exerciseCategoryIcon(category),
                color: iconColor,
                size: context.dashSpacing * 1.15,
              ),
            ),
            SizedBox(width: context.dashSpacing * 0.75),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          exercise.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                      ),
                      if (category != null && category.isNotEmpty) ...[
                        SizedBox(width: context.dashSpacing * 0.4),
                        Flexible(
                          child: SpecialistExerciseCategoryBadge(label: category),
                        ),
                      ],
                    ],
                  ),
                  if (summary != null && summary.isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing * 0.35),
                    Text(
                      summary,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ],
                  if (showMediaIndicator) ...[
                    SizedBox(height: context.dashSpacing * 0.4),
                    Row(
                      children: [
                        Icon(
                          Icons.perm_media_outlined,
                          size: context.dashSpacing * 0.85,
                          color: DashboardColors.textMuted,
                        ),
                        SizedBox(width: context.dashSpacing * 0.25),
                        Text(
                          'Includes instruction media',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: DashboardColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
