import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_feature_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'manage_goals_widgets.dart';
import 'specialist_scoped_localization_utils.dart';

const specialistExerciseAllCategoryLabel = 'All';

/// Canonical Speech Articulation category name used for V2/V3 metadata UI.
const specialistSpeechArticulationCategoryName = 'Speech Articulation';

bool isSpeechArticulationCategoryName(String? categoryName) {
  final normalized = categoryName?.trim().toLowerCase() ?? '';
  return normalized == specialistSpeechArticulationCategoryName.toLowerCase();
}

/// Preferred chip order only. Filters are always built from live API data.
const _knownCategoryOrder = [
  specialistSpeechArticulationCategoryName,
  'Fluency',
  'Language Development',
  'Voice & Breathing',
  'Fine Motor Skills',
  'Gross Motor Skills',
  'Sensory Integration',
  'Daily Living Skills',
  'Motor Rehabilitation',
  'Behavioral Skills',
  'Social Communication',
  'Autism Support',
  'Developmental Activities',
  'Learning & Cognitive Skills',
  'Speech Therapy',
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
      exercise.description,
      exercise.languageLabel,
    ].whereType<String>().join(' ').toLowerCase();

    return searchable.contains(query);
  }).toList();
}

IconData exerciseCategoryIcon(String? category) {
  final normalized = category?.trim().toLowerCase() ?? '';
  if (normalized.contains('articulation') ||
      normalized.contains('speech') ||
      normalized.contains('voice') ||
      normalized.contains('fluency')) {
    return Icons.record_voice_over_rounded;
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

Color exerciseCategoryIconColor(String? category) {
  final normalized = category?.trim().toLowerCase() ?? '';
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
  final normalized = category?.trim().toLowerCase() ?? '';
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

Widget buildExerciseSearchField({
  required BuildContext context,
  required TextEditingController controller,
  required ValueChanged<String> onChanged,
}) {
  final l10n = AppLocalizations.of(context)!;

  return TextField(
    controller: controller,
    onChanged: onChanged,
    textInputAction: TextInputAction.search,
    decoration: goalFieldDecoration(l10n.specialistSearchExercisesHint)
        .copyWith(
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
    final l10n = AppLocalizations.of(context)!;

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
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.sizeOf(context).width * 0.55,
              ),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing * 0.65,
                  vertical: context.dashSpacing * 0.45,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? DashboardColors.brandSoft
                      : DashboardColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.border,
                  ),
                ),
                child: Text(
                  localizedExerciseCategory(l10n, category),
                  maxLines: 1,
                  softWrap: false,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: isSelected
                        ? DashboardColors.brandCyan
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
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
    this.onTap,
    this.isSelected = false,
    this.showMediaIndicator = false,
    this.showChevron = false,
    this.trailing,
  });

  final SpecialistExerciseItem exercise;
  final VoidCallback? onTap;
  final bool isSelected;
  final bool showMediaIndicator;
  final bool showChevron;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final category = exercise.category?.trim();
    final summary = exercise.previewText;
    final iconColor = exerciseCategoryIconColor(category);
    final iconBackground = exerciseCategoryIconBackground(category);
    final showMedia = showMediaIndicator || exercise.hasMedia;

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        tint: isSelected ? DashboardColors.brandCyan : iconColor,
        onTap: onTap,
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
                          child: SpecialistExerciseCategoryBadge(
                            label: category,
                          ),
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
                  if (showMedia) ...[
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
                          l10n.specialistExerciseIncludesMedia,
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
                  if (isSelected) ...[
                    SizedBox(height: context.dashSpacing * 0.35),
                    Text(
                      l10n.commonSelected,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: DashboardColors.brandCyan,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null)
              trailing!
            else if (showChevron || onTap != null) ...[
              SizedBox(width: context.dashSpacing * 0.25),
              Icon(
                isSelected
                    ? Icons.check_circle_rounded
                    : Icons.chevron_right_rounded,
                color: isSelected
                    ? DashboardColors.brandCyan
                    : DashboardColors.textMuted,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

typedef ExerciseLibraryItemBuilder =
    Widget Function(BuildContext context, SpecialistExerciseItem exercise);

class ExerciseLibraryBody extends StatelessWidget {
  const ExerciseLibraryBody({
    super.key,
    required this.isLoading,
    required this.errorMessage,
    required this.onRetry,
    required this.items,
    required this.searchController,
    required this.selectedCategory,
    required this.onCategoryChanged,
    required this.onSearchChanged,
    required this.itemBuilder,
    this.headerTitle = 'Exercise Library',
    this.headerSubtitle = 'Browse therapy exercises by category and search.',
    this.emptyItemsMessage =
        'No exercises available yet. New exercises will appear here once added.',
    this.emptyFilteredMessage = 'No exercises match your filters.',
    this.headerAction,
  });

  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onRetry;
  final List<SpecialistExerciseItem> items;
  final TextEditingController searchController;
  final String selectedCategory;
  final ValueChanged<String> onCategoryChanged;
  final ValueChanged<String> onSearchChanged;
  final ExerciseLibraryItemBuilder itemBuilder;
  final String headerTitle;
  final String headerSubtitle;
  final String emptyItemsMessage;
  final String emptyFilteredMessage;
  final Widget? headerAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final categories = buildExerciseCategoryFilters(items);
    final visible = filterExercises(
      items,
      searchQuery: searchController.text,
      selectedCategory: selectedCategory,
    );

    if (isLoading) {
      return const Center(child: DashboardLoadingCard());
    }

    if (errorMessage != null && items.isEmpty) {
      return Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(message: errorMessage!, onRetry: onRetry),
      );
    }

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: context.dashPadding,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    headerTitle,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.25),
                  Text(
                    headerSubtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (headerAction != null) ...[
              SizedBox(width: context.dashSpacing * 0.5),
              headerAction!,
            ],
          ],
        ),
        SizedBox(height: context.dashSpacing * 0.75),
        buildExerciseSearchField(
          context: context,
          controller: searchController,
          onChanged: onSearchChanged,
        ),
        if (items.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.75),
          SpecialistExerciseCategoryChips(
            categories: categories,
            selected: selectedCategory,
            onChanged: onCategoryChanged,
          ),
        ],
        if (errorMessage != null) ...[
          SizedBox(height: context.dashSpacing * 0.75),
          DashboardErrorCard(message: errorMessage!, onRetry: onRetry),
        ],
        SizedBox(height: context.dashSpacing * 0.75),
        if (items.isEmpty)
          DashboardEmptyCard(message: emptyItemsMessage)
        else if (visible.isEmpty)
          DashboardEmptyCard(message: emptyFilteredMessage)
        else
          ...visible.map((exercise) => itemBuilder(context, exercise)),
        SizedBox(height: context.dashSpacing),
      ],
    );
  }
}
