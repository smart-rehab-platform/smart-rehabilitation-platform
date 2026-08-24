import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/locale/locale_provider.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../core/theme/dashboard_theme.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../data/translation_repository.dart';
import '../../models/specialist_feature_models.dart';
import '../../providers/specialist_exercise_assignment_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/exercise_instruction_media_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_exercises_localization_utils.dart';
import 'specialist_exercises_widgets.dart';

class SpecialistExerciseDetailsScreen extends ConsumerStatefulWidget {
  const SpecialistExerciseDetailsScreen({
    super.key,
    required this.exerciseId,
    this.useAdminChrome = false,
  });

  final String exerciseId;
  final bool useAdminChrome;

  @override
  ConsumerState<SpecialistExerciseDetailsScreen> createState() =>
      _SpecialistExerciseDetailsScreenState();
}

class _SpecialistExerciseDetailsScreenState
    extends ConsumerState<SpecialistExerciseDetailsScreen> {
  String? _displayTitle;
  String? _displayDescription;
  String? _displayInstructions;
  String? _translationKey;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistExerciseDetailProvider(widget.exerciseId).notifier)
          .initialize();
    });
  }

  Future<void> _syncTranslatedContent(SpecialistExerciseItem exercise) async {
    final locale = ref.read(localeProvider);
    final language = languageCodeFromLocale(locale);
    final key =
        '${exercise.id}|$language|${exercise.title}|${exercise.description}|${exercise.instructions}';
    if (_translationKey == key) {
      return;
    }
    _translationKey = key;

    if (language != 'ar') {
      if (!mounted) return;
      setState(() {
        _displayTitle = exercise.title;
        _displayDescription = exercise.description;
        _displayInstructions = exercise.instructions;
      });
      return;
    }

    final translated = await ref
        .read(translationRepositoryProvider)
        .translateExerciseFields(
          title: exercise.title,
          description: exercise.description,
          instructions: exercise.instructions,
          targetLanguage: 'ar',
        );
    if (!mounted || _translationKey != key) {
      return;
    }
    setState(() {
      _displayTitle = translated.title;
      _displayDescription = translated.description;
      _displayInstructions = translated.instructions;
    });
  }

  Future<void> _openEdit(SpecialistExerciseItem exercise) async {
    final updated = await context.push<bool>(
      widget.useAdminChrome
          ? AppRoutes.adminEditExercise(exercise.id)
          : AppRoutes.specialistEditExercise(exercise.id),
    );
    if (!mounted) return;
    if (updated == true) {
      await ref
          .read(specialistExerciseDetailProvider(widget.exerciseId).notifier)
          .refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(
      specialistExerciseDetailProvider(widget.exerciseId),
    );
    final notifier = ref.read(
      specialistExerciseDetailProvider(widget.exerciseId).notifier,
    );
    final auth = ref.watch(authProvider);
    ref.watch(localeProvider);
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && state.exercise == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapSpecialistExerciseDetailError(l10n, state.errorMessage!),
          onRetry: notifier.refresh,
        ),
      );
    } else if (state.exercise == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardEmptyCard(message: l10n.specialistExerciseNotFound),
      );
    } else {
      final exercise = state.exercise!;
      final category = exercise.category?.trim();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _syncTranslatedContent(exercise);
      });
      final description =
          (_displayDescription ?? exercise.description)?.trim();
      final instructions =
          (_displayInstructions ?? exercise.instructions)?.trim();
      final title = (_displayTitle ?? exercise.title).trim();
      final canEdit = exercise.canEditBy(
        userId: auth.user?.id,
        role: auth.user?.role,
      );

      body = ListView(
        padding: context.dashPadding,
        children: [
          DashboardSurfaceCard(
            tint: exerciseCategoryIconColor(category),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: context.dashSpacing * 2.6,
                      height: context.dashSpacing * 2.6,
                      decoration: BoxDecoration(
                        color: exerciseCategoryIconBackground(category),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Icon(
                        exerciseCategoryIcon(category),
                        color: exerciseCategoryIconColor(category),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.75),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: DashboardColors.textPrimary,
                            ),
                          ),
                          if (category != null && category.isNotEmpty) ...[
                            SizedBox(height: context.dashSpacing * 0.4),
                            SpecialistExerciseCategoryBadge(label: category),
                          ],
                          SizedBox(height: context.dashSpacing * 0.35),
                          Text(
                            l10n.specialistExerciseLanguageLine(
                              localizedExerciseLanguageLabel(
                                l10n,
                                exercise.languageLabel,
                              ),
                            ),
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: DashboardColors.textMuted,
                            ),
                          ),
                          if ((exercise.createdByName ?? '')
                              .trim()
                              .isNotEmpty) ...[
                            SizedBox(height: context.dashSpacing * 0.35),
                            Text(
                              l10n.specialistExerciseCreatedBy(
                                exercise.createdByName!.trim(),
                              ),
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: DashboardColors.textMuted,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
                if (canEdit) ...[
                  SizedBox(height: context.dashSpacing * 0.75),
                  OutlinedButton.icon(
                    onPressed: () => _openEdit(exercise),
                    icon: const Icon(Icons.edit_outlined),
                    label: Text(l10n.specialistExerciseEditExercise),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: DashboardColors.brandCyan,
                      side: const BorderSide(color: DashboardColors.brandCyan),
                    ),
                  ),
                ],
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _DetailSection(
            title: l10n.specialistExerciseDescriptionSection,
            body: (description != null && description.isNotEmpty)
                ? description
                : l10n.specialistExerciseNoDescription,
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          _DetailSection(
            title: l10n.specialistExerciseInstructionsSection,
            body: (instructions != null && instructions.isNotEmpty)
                ? instructions
                : l10n.specialistExerciseNoInstructions,
          ),
          if ((exercise.expectedText ?? '').trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.65),
            _DetailSection(
              title: l10n.specialistExerciseExpectedTextSection,
              body: exercise.expectedText!.trim(),
            ),
          ],
          if ((exercise.targetPhoneme ?? '').trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.65),
            _DetailSection(
              title: l10n.specialistExerciseTargetSoundSection,
              body: exercise.targetPhoneme!.trim(),
            ),
          ],
          if (exercise.hasMedia) ...[
            SizedBox(height: context.dashSpacing * 0.65),
            ExerciseInstructionMediaCard(
              mediaUrl: exercise.instructionMediaUrl!,
              title: l10n.specialistExerciseInstructionMediaTitle,
            ),
          ],
          SizedBox(height: context.dashSpacing),
        ],
      );
    }

    if (widget.useAdminChrome) {
      return AdminPageScaffold(
        title: l10n.specialistExerciseDetailsTitle,
        showBackButton: true,
        showBottomNav: false,
        body: Theme(data: DashboardTheme.light, child: body),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.specialistExerciseDetailsTitle,
      showBackButton: true,
      body: body,
    );
  }
}

class _DetailSection extends StatelessWidget {
  const _DetailSection({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          Text(
            body,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
