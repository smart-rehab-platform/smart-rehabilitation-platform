import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../data/specialist_patient_details_repository.dart';
import '../../models/family_pattern_details_models.dart';
import '../../models/family_pattern_insight_models.dart';
import '../../widgets/dashboard_layout.dart';

const _familyPatternNoteDraft =
    'Repeated clinical characteristics were detected across children linked to the same parent account. Further family-history inquiry may be considered.';

const _familyPatternParentMessageDraft =
    'Hello,\n\nWhile reviewing the rehabilitation records, I noticed similar developmental characteristics across multiple children linked to your account.\n\nThis does not indicate a hereditary or genetic diagnosis.\n\nI would like to ask whether there is any known family history of speech, language, developmental, learning, or related difficulties.\n\nPlease feel free to reply here or discuss this during the next session.\n\nThank you.';

const _familyPatternSessionNotesDraft =
    'Family history review and follow-up discussion.';

typedef FamilyPatternAddNoteCallback = Future<void> Function(String draftText);
typedef FamilyPatternContactParentCallback =
    Future<void> Function(String draftText);
typedef FamilyPatternScheduleFollowUpCallback =
    Future<void> Function(String draftNotes);

Future<void> showFamilyPatternDetailsSheet({
  required BuildContext context,
  required String patientId,
  required FamilyPatternInsight insight,
  required SpecialistPatientDetailsRepository repository,
  required FamilyPatternAddNoteCallback onAddClinicalNote,
  required FamilyPatternContactParentCallback onContactParent,
  required FamilyPatternScheduleFollowUpCallback onScheduleFollowUp,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) => FamilyPatternDetailsSheet(
      patientId: patientId,
      insight: insight,
      repository: repository,
      onAddClinicalNote: onAddClinicalNote,
      onContactParent: onContactParent,
      onScheduleFollowUp: onScheduleFollowUp,
    ),
  );
}

class FamilyPatternDetailsSheet extends StatefulWidget {
  const FamilyPatternDetailsSheet({
    super.key,
    required this.patientId,
    required this.insight,
    required this.repository,
    required this.onAddClinicalNote,
    required this.onContactParent,
    required this.onScheduleFollowUp,
  });

  final String patientId;
  final FamilyPatternInsight insight;
  final SpecialistPatientDetailsRepository repository;
  final FamilyPatternAddNoteCallback onAddClinicalNote;
  final FamilyPatternContactParentCallback onContactParent;
  final FamilyPatternScheduleFollowUpCallback onScheduleFollowUp;

  @override
  State<FamilyPatternDetailsSheet> createState() =>
      _FamilyPatternDetailsSheetState();
}

class _FamilyPatternDetailsSheetState extends State<FamilyPatternDetailsSheet> {
  FamilyPatternDetails? _details;
  bool _isLoading = true;
  bool _loadFailed = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    setState(() {
      _isLoading = true;
      _loadFailed = false;
      _errorMessage = null;
    });

    try {
      final details = await widget.repository.fetchFamilyPatternDetails(
        widget.patientId,
      );
      if (!mounted) return;
      setState(() {
        _details = details;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _loadFailed = true;
        _errorMessage = error.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final details = _details;
    final evidenceLevel =
        details?.evidenceLevel ?? widget.insight.evidenceLevel;
    final patternScore = details?.patternScore ?? widget.insight.patternScore;
    final badge = _EvidenceBadgeStyle.fromLevel(evidenceLevel);

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.45,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Material(
          color: DashboardColors.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              Padding(
                padding: EdgeInsets.fromLTRB(
                  context.dashSpacing * 0.75,
                  context.dashSpacing * 0.55,
                  context.dashSpacing * 0.35,
                  context.dashSpacing * 0.45,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Family Pattern Details',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: DashboardColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: context.dashSpacing * 0.2),
                              Text(
                                'Review which linked children matched each detected pattern.',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: DashboardColors.textSecondary,
                                  height: 1.35,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.close_rounded),
                          tooltip: 'Close',
                        ),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing * 0.35),
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: context.dashSpacing * 0.5,
                            vertical: context.dashSpacing * 0.2,
                          ),
                          decoration: BoxDecoration(
                            color: badge.backgroundColor,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            badge.label,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: badge.foregroundColor,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        SizedBox(width: context.dashSpacing * 0.45),
                        Text(
                          '$patternScore / 100',
                          style: theme.textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.brandCyan,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: DashboardColors.brandCyan,
                        ),
                      )
                    : _loadFailed
                    ? _DetailsErrorState(
                        message: _errorMessage,
                        onRetry: _loadDetails,
                      )
                    : ListView(
                        controller: scrollController,
                        padding: EdgeInsets.fromLTRB(
                          context.dashSpacing * 0.75,
                          context.dashSpacing * 0.6,
                          context.dashSpacing * 0.75,
                          context.dashSpacing * 0.85,
                        ),
                        children: [
                          if (details != null &&
                              details.hiddenMatchedChildrenCount > 0)
                            Padding(
                              padding: EdgeInsets.only(
                                bottom: context.dashSpacing * 0.55,
                              ),
                              child: _HiddenMatchesNotice(
                                count: details.hiddenMatchedChildrenCount,
                              ),
                            ),
                          if (details == null || !details.hasVisibleGroups)
                            Padding(
                              padding: EdgeInsets.only(
                                bottom: context.dashSpacing * 0.55,
                              ),
                              child: Text(
                                'No detailed matches are available.',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: DashboardColors.textSecondary,
                                ),
                              ),
                            )
                          else
                            ...details.groups.map(
                              (group) => Padding(
                                padding: EdgeInsets.only(
                                  bottom: context.dashSpacing * 0.65,
                                ),
                                child: _PatternDetailsGroupSection(
                                  group: group,
                                ),
                              ),
                            ),
                          if (details != null && details.disclaimer.isNotEmpty)
                            _DisclaimerSection(text: details.disclaimer),
                          SizedBox(height: context.dashSpacing * 0.55),
                          _SpecialistActionsSection(
                            onAddClinicalNote: () async {
                              await widget.onAddClinicalNote(
                                _familyPatternNoteDraft,
                              );
                            },
                            onContactParent: () async {
                              await widget.onContactParent(
                                _familyPatternParentMessageDraft,
                              );
                            },
                            onScheduleFollowUp: () async {
                              await widget.onScheduleFollowUp(
                                _familyPatternSessionNotesDraft,
                              );
                            },
                          ),
                        ],
                      ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _DetailsErrorState extends StatelessWidget {
  const _DetailsErrorState({this.message, required this.onRetry});

  final String? message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: context.dashPadding,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: DashboardColors.textMuted),
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              'Unable to load matched children details.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
            if (message != null && message!.isNotEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.25),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.55),
            FilledButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

class _HiddenMatchesNotice extends StatelessWidget {
  const _HiddenMatchesNotice({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.55,
        vertical: context.dashSpacing * 0.45,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.blueSoft.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: DashboardColors.border.withValues(alpha: 0.8),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.visibility_off_outlined,
            size: 16,
            color: DashboardColors.textMuted.withValues(alpha: 0.95),
          ),
          SizedBox(width: context.dashSpacing * 0.35),
          Expanded(
            child: Text(
              count == 1
                  ? 'Some matched children are not shown because you are not assigned to their records.'
                  : '$count matched children are not shown because you are not assigned to their records.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PatternDetailsGroupSection extends StatelessWidget {
  const _PatternDetailsGroupSection({required this.group});

  final FamilyPatternDetailsGroup group;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final value = group.condition ?? group.category;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          group.label,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
          ),
        ),
        if (value != null && value.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.35,
            ),
          ),
        ],
        if (group.overlappingKeywords.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            'Shared terms:',
            style: theme.textTheme.labelMedium?.copyWith(
              color: DashboardColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.18),
          Wrap(
            spacing: context.dashSpacing * 0.22,
            runSpacing: context.dashSpacing * 0.18,
            children: group.overlappingKeywords
                .map(
                  (keyword) => Chip(
                    label: Text(keyword),
                    visualDensity: VisualDensity.compact,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    labelPadding: const EdgeInsets.symmetric(horizontal: 4),
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
          ),
        ],
        if (group.children.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.35),
          ...group.children.map(
            (child) => Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.28),
              child: _MatchedChildRow(child: child),
            ),
          ),
        ],
        SizedBox(height: context.dashSpacing * 0.35),
        const Divider(height: 1),
      ],
    );
  }
}

class _MatchedChildRow extends StatelessWidget {
  const _MatchedChildRow({required this.child});

  final FamilyPatternMatchedChild child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: DashboardColors.brandSoft.withValues(alpha: 0.9),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.person_outline_rounded,
            size: 16,
            color: DashboardColors.brandCyan,
          ),
        ),
        SizedBox(width: context.dashSpacing * 0.4),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                child.patientName,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                ),
              ),
              if (child.matchedValue != null &&
                  child.matchedValue!.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.08),
                Text(
                  'Matched value: ${child.matchedValue}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
              if (child.matchedKeywords.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.12),
                Wrap(
                  spacing: context.dashSpacing * 0.18,
                  runSpacing: context.dashSpacing * 0.12,
                  children: child.matchedKeywords
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
                          backgroundColor: DashboardColors.blueSoft,
                          labelStyle: theme.textTheme.labelSmall?.copyWith(
                            color: DashboardColors.brandSecondaryBlue,
                            fontSize: 10.5,
                          ),
                          side: BorderSide.none,
                        ),
                      )
                      .toList(),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _SpecialistActionsSection extends StatelessWidget {
  const _SpecialistActionsSection({
    required this.onAddClinicalNote,
    required this.onContactParent,
    required this.onScheduleFollowUp,
  });

  final VoidCallback onAddClinicalNote;
  final VoidCallback onContactParent;
  final VoidCallback onScheduleFollowUp;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        OutlinedButton.icon(
          onPressed: onAddClinicalNote,
          icon: const Icon(Icons.note_add_outlined, size: 18),
          label: const Text('Add Clinical Note'),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        OutlinedButton.icon(
          onPressed: onContactParent,
          icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
          label: const Text('Contact Parent'),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        FilledButton.icon(
          onPressed: onScheduleFollowUp,
          icon: const Icon(Icons.event_available_outlined, size: 18),
          label: const Text('Schedule Follow-up'),
        ),
      ],
    );
  }
}

class _DisclaimerSection extends StatelessWidget {
  const _DisclaimerSection({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.5,
        vertical: context.dashSpacing * 0.4,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.blueSoft.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline,
            size: 14,
            color: DashboardColors.textMuted.withValues(alpha: 0.9),
          ),
          SizedBox(width: context.dashSpacing * 0.35),
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
                height: 1.35,
                fontSize: 11.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _EvidenceBadgeStyle {
  const _EvidenceBadgeStyle({
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  final String label;
  final Color backgroundColor;
  final Color foregroundColor;

  static _EvidenceBadgeStyle fromLevel(String level) {
    switch (level.trim().toUpperCase()) {
      case 'HIGH':
        return const _EvidenceBadgeStyle(
          label: 'High Evidence',
          backgroundColor: DashboardColors.tealSoft,
          foregroundColor: DashboardColors.accent,
        );
      case 'MODERATE':
        return const _EvidenceBadgeStyle(
          label: 'Moderate Evidence',
          backgroundColor: DashboardColors.amberSoft,
          foregroundColor: DashboardColors.warning,
        );
      case 'LOW':
      default:
        return const _EvidenceBadgeStyle(
          label: 'Low Evidence',
          backgroundColor: DashboardColors.blueSoft,
          foregroundColor: DashboardColors.brandSecondaryBlue,
        );
    }
  }
}
