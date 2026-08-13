import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/family_pattern_insight_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'specialist_patient_details_localization_utils.dart';

class FamilyPatternInsightCard extends StatelessWidget {
  const FamilyPatternInsightCard({
    super.key,
    required this.insight,
    this.onReviewMatchedChildren,
  });

  final FamilyPatternInsight insight;
  final VoidCallback? onReviewMatchedChildren;

  @override
  Widget build(BuildContext context) {
    if (!insight.hasSiblings) {
      return const SizedBox.shrink();
    }

    if (!insight.hasDetectedPatterns) {
      return _NeutralInsightCard(
        message: AppLocalizations.of(
          context,
        )!.specialistFamilyPatternNoPatternsDetected,
      );
    }

    return _FullInsightCard(
      insight: insight,
      onReviewMatchedChildren: onReviewMatchedChildren,
    );
  }
}

class FamilyPatternInsightLoadingCard extends StatelessWidget {
  const FamilyPatternInsightLoadingCard({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Row(
        children: [
          SizedBox(
            width: context.dashSpacing * 1.1,
            height: context.dashSpacing * 1.1,
            child: const CircularProgressIndicator(
              strokeWidth: 2,
              color: DashboardColors.brandCyan,
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.75),
          Expanded(
            child: Text(
              l10n.specialistFamilyPatternLoading,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FamilyPatternInsightRetryCard extends StatelessWidget {
  const FamilyPatternInsightRetryCard({super.key, required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return DashboardSurfaceCard(
      child: Row(
        children: [
          const Icon(
            Icons.info_outline,
            color: DashboardColors.textMuted,
            size: 20,
          ),
          SizedBox(width: context.dashSpacing * 0.6),
          Expanded(
            child: Text(
              l10n.specialistFamilyPatternUnavailable,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ),
          TextButton(onPressed: onRetry, child: Text(l10n.commonRetry)),
        ],
      ),
    );
  }
}

class _NeutralInsightCard extends StatelessWidget {
  const _NeutralInsightCard({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CardTitleRow(),
          SizedBox(height: context.dashSpacing * 0.5),
          _ClinicalSummaryBox(summary: message),
        ],
      ),
    );
  }
}

class _FullInsightCard extends StatefulWidget {
  const _FullInsightCard({required this.insight, this.onReviewMatchedChildren});

  final FamilyPatternInsight insight;
  final VoidCallback? onReviewMatchedChildren;

  @override
  State<_FullInsightCard> createState() => _FullInsightCardState();
}

class _FullInsightCardState extends State<_FullInsightCard> {
  bool _showAllFindings = false;

  static const _visiblePatternCount = 3;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final insight = widget.insight;
    final badge = _EvidenceBadgeStyle.fromLevel(l10n, insight.evidenceLevel);
    final scoreRatio = (insight.patternScore.clamp(0, 100)) / 100;
    final scoreCaption = localizedFamilyPatternScoreCaption(
      l10n,
      insight.evidenceLevel,
    );
    final hasHiddenPatterns = insight.patterns.length > _visiblePatternCount;
    final visiblePatterns = !_showAllFindings && hasHiddenPatterns
        ? insight.patterns.take(_visiblePatternCount).toList()
        : insight.patterns;
    final showReviewButton =
        insight.hasSiblings &&
        insight.matchedChildren > 0 &&
        insight.hasDetectedPatterns &&
        widget.onReviewMatchedChildren != null;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CardTitleRow(evidenceBadge: badge),
          SizedBox(height: context.dashSpacing * 0.55),
          _ClinicalSummaryBox(summary: insight.summaryReason),
          SizedBox(height: context.dashSpacing * 0.6),
          Semantics(
            label: l10n.specialistFamilyPatternScoreSemantics(
              insight.patternScore,
              scoreCaption,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        l10n.specialistFamilyPatternPatternScore,
                        style: theme.textTheme.labelLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                    ),
                    Text(
                      '${insight.patternScore} / 100',
                      style: theme.textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: DashboardColors.brandCyan,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: LinearProgressIndicator(
                    value: scoreRatio,
                    minHeight: 7,
                    backgroundColor: DashboardColors.border,
                    color: DashboardColors.brandCyan,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                Text(
                  scoreCaption,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.55),
          _LinkedChildrenBadge(count: insight.matchedChildren),
          SizedBox(height: context.dashSpacing * 0.6),
          ...visiblePatterns.map(
            (pattern) => Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.45),
              child: _PatternRow(pattern: pattern),
            ),
          ),
          if (hasHiddenPatterns) ...[
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: TextButton.icon(
                onPressed: () {
                  setState(() => _showAllFindings = !_showAllFindings);
                },
                icon: Icon(
                  _showAllFindings
                      ? Icons.keyboard_arrow_up_rounded
                      : Icons.keyboard_arrow_down_rounded,
                  size: 18,
                ),
                label: Text(
                  _showAllFindings
                      ? l10n.specialistFamilyPatternShowFewerFindings
                      : l10n.specialistFamilyPatternViewAllFindings,
                ),
                style: TextButton.styleFrom(
                  foregroundColor: DashboardColors.brandCyan,
                  padding: EdgeInsets.symmetric(
                    horizontal: context.dashSpacing * 0.15,
                  ),
                  visualDensity: VisualDensity.compact,
                ),
              ),
            ),
          ],
          if (showReviewButton) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: widget.onReviewMatchedChildren,
                icon: const Icon(Icons.chevron_right_rounded, size: 18),
                label: Text(l10n.specialistFamilyPatternReviewMatchedChildren),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.brandCyan,
                  side: BorderSide(
                    color: DashboardColors.brandCyan.withValues(alpha: 0.45),
                  ),
                  backgroundColor: DashboardColors.brandSoft.withValues(
                    alpha: 0.35,
                  ),
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.35,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CardTitleRow extends StatelessWidget {
  const _CardTitleRow({this.evidenceBadge});

  final _EvidenceBadgeStyle? evidenceBadge;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _InsightIconBadge(icon: Icons.family_restroom_outlined),
        SizedBox(width: context.dashSpacing * 0.55),
        Expanded(
          child: Text(
            l10n.specialistFamilyPatternInsightTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
        ),
        if (evidenceBadge != null)
          Semantics(
            label: evidenceBadge!.semanticLabel,
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: context.dashSpacing * 0.5,
                vertical: context.dashSpacing * 0.2,
              ),
              decoration: BoxDecoration(
                color: evidenceBadge!.backgroundColor,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                evidenceBadge!.label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: evidenceBadge!.foregroundColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ClinicalSummaryBox extends StatelessWidget {
  const _ClinicalSummaryBox({required this.summary});

  final String summary;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.65,
        vertical: context.dashSpacing * 0.55,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: DashboardColors.brandCyan.withValues(alpha: 0.12),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              ColorFiltered(
                colorFilter: const ColorFilter.mode(
                  DashboardColors.brandCyan,
                  BlendMode.srcIn,
                ),
                child: Image.asset(
                  'assets/icons/family_pattern/brain.png',
                  width: 16,
                  height: 16,
                  fit: BoxFit.contain,
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.3),
              Text(
                l10n.specialistFamilyPatternClinicalSummary,
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.brandCyan,
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            summary,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textPrimary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _LinkedChildrenBadge extends StatelessWidget {
  const _LinkedChildrenBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final label = localizedFamilyPatternMatchedChildrenLabel(l10n, count);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: context.dashSpacing * 0.55,
            vertical: context.dashSpacing * 0.3,
          ),
          decoration: BoxDecoration(
            color: DashboardColors.blueSoft.withValues(alpha: 0.7),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: DashboardColors.border.withValues(alpha: 0.8),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.family_restroom_outlined,
                size: 16,
                color: DashboardColors.brandSecondaryBlue,
              ),
              SizedBox(width: context.dashSpacing * 0.35),
              Text(
                label,
                style: theme.textTheme.labelMedium?.copyWith(
                  color: DashboardColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.18),
        Text(
          l10n.specialistFamilyPatternMatchedAtLeastOne,
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textMuted,
            fontSize: 11.5,
          ),
        ),
      ],
    );
  }
}

class _PatternRow extends StatelessWidget {
  const _PatternRow({required this.pattern});

  final FamilyPatternItem pattern;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final presentation = _PatternPresentation.fromType(pattern.type);
    final value = _patternValue(pattern);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _PatternIconBadge(
          assetPath: presentation.iconAsset,
          icon: presentation.icon,
        ),
        SizedBox(width: context.dashSpacing * 0.45),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                localizedFamilyPatternType(l10n, pattern.type),
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                  fontSize: 14,
                ),
              ),
              if (value != null && value.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.12),
                if (presentation.useWrapForValue)
                  Wrap(
                    spacing: context.dashSpacing * 0.25,
                    runSpacing: context.dashSpacing * 0.18,
                    children: pattern.overlappingKeywords
                        .map(
                          (keyword) => Chip(
                            label: Text(keyword),
                            visualDensity: VisualDensity.compact,
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                            padding: const EdgeInsets.symmetric(horizontal: 2),
                            labelPadding: const EdgeInsets.symmetric(
                              horizontal: 4,
                            ),
                            backgroundColor: DashboardColors.brandSoft,
                            labelStyle: theme.textTheme.labelSmall?.copyWith(
                              color: DashboardColors.brandCyan,
                              fontSize: 11,
                              height: 1.1,
                            ),
                            side: BorderSide.none,
                          ),
                        )
                        .toList(),
                  )
                else
                  Text(
                    value,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                      height: 1.3,
                    ),
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  String? _patternValue(FamilyPatternItem pattern) {
    switch (pattern.type) {
      case 'shared_diagnosis':
        return pattern.condition;
      case 'shared_case_category':
        return pattern.category;
      case 'shared_difficulties':
      case 'previous_diagnosis_similarity':
      case 'family_history_similarity':
        return pattern.overlappingKeywords.isEmpty
            ? null
            : pattern.overlappingKeywords.join(', ');
      default:
        return pattern.condition ?? pattern.category;
    }
  }
}

class _InsightIconBadge extends StatelessWidget {
  const _InsightIconBadge({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: context.dashSpacing * 1.25,
      height: context.dashSpacing * 1.25,
      decoration: const BoxDecoration(
        color: DashboardColors.brandSoft,
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: DashboardColors.brandCyan, size: 20),
    );
  }
}

class _PatternIconBadge extends StatelessWidget {
  const _PatternIconBadge({this.assetPath, this.icon})
    : assert(assetPath != null || icon != null);

  final String? assetPath;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 30,
      height: 30,
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft.withValues(alpha: 0.9),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: assetPath != null
            ? ColorFiltered(
                colorFilter: const ColorFilter.mode(
                  DashboardColors.brandCyan,
                  BlendMode.srcIn,
                ),
                child: Image.asset(
                  assetPath!,
                  width: 16,
                  height: 16,
                  fit: BoxFit.contain,
                ),
              )
            : Icon(icon, color: DashboardColors.brandCyan, size: 16),
      ),
    );
  }
}

class _EvidenceBadgeStyle {
  const _EvidenceBadgeStyle({
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
    required this.semanticLabel,
  });

  final String label;
  final Color backgroundColor;
  final Color foregroundColor;
  final String semanticLabel;

  static _EvidenceBadgeStyle fromLevel(AppLocalizations l10n, String level) {
    switch (level.trim().toUpperCase()) {
      case 'HIGH':
        return _EvidenceBadgeStyle(
          label: l10n.specialistFamilyPatternEvidenceHigh,
          backgroundColor: DashboardColors.tealSoft,
          foregroundColor: DashboardColors.accent,
          semanticLabel: l10n.specialistFamilyPatternEvidenceSemanticHigh,
        );
      case 'MODERATE':
        return _EvidenceBadgeStyle(
          label: l10n.specialistFamilyPatternEvidenceModerate,
          backgroundColor: DashboardColors.amberSoft,
          foregroundColor: DashboardColors.warning,
          semanticLabel: l10n.specialistFamilyPatternEvidenceSemanticModerate,
        );
      case 'LOW':
      default:
        return _EvidenceBadgeStyle(
          label: l10n.specialistFamilyPatternEvidenceLow,
          backgroundColor: DashboardColors.blueSoft,
          foregroundColor: DashboardColors.brandSecondaryBlue,
          semanticLabel: l10n.specialistFamilyPatternEvidenceSemanticLow,
        );
    }
  }
}

class _PatternPresentation {
  const _PatternPresentation({
    this.iconAsset,
    this.icon,
    this.useWrapForValue = false,
  }) : assert(iconAsset != null || icon != null);

  final String? iconAsset;
  final IconData? icon;
  final bool useWrapForValue;

  static const _stethoscopeIcon = 'assets/icons/family_pattern/stethoscope.png';
  static const _clipboardListIcon =
      'assets/icons/family_pattern/clipboard_list.png';
  static const _eyeSearchIcon = 'assets/icons/family_pattern/eye_search.png';
  static const _historyIcon = 'assets/icons/family_pattern/history.png';

  static _PatternPresentation fromType(String type) {
    switch (type) {
      case 'shared_diagnosis':
        return const _PatternPresentation(iconAsset: _stethoscopeIcon);
      case 'shared_case_category':
        return const _PatternPresentation(iconAsset: _clipboardListIcon);
      case 'shared_difficulties':
        return const _PatternPresentation(
          iconAsset: _eyeSearchIcon,
          useWrapForValue: true,
        );
      case 'previous_diagnosis_similarity':
        return const _PatternPresentation(
          iconAsset: _historyIcon,
          useWrapForValue: true,
        );
      case 'family_history_similarity':
        return const _PatternPresentation(
          icon: Icons.groups_outlined,
          useWrapForValue: true,
        );
      default:
        return const _PatternPresentation(icon: Icons.insights_outlined);
    }
  }
}
