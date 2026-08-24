import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'specialist_ai_report_section_labels.dart';

class SpecialistAiReportDraftEditPanel extends StatelessWidget {
  const SpecialistAiReportDraftEditPanel({
    super.key,
    required this.fieldIds,
    required this.controllers,
    required this.textDirection,
    required this.listHint,
  });

  final List<String> fieldIds;
  final Map<String, TextEditingController> controllers;
  final TextDirection textDirection;
  final String listHint;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Column(
      children: fieldIds.map((fieldId) {
        final controller = controllers[fieldId];
        if (controller == null) {
          return const SizedBox.shrink();
        }

        final isListField = specialistAiReportIsListField(fieldId);
        final title = specialistAiReportSectionTitle(l10n, fieldId);

        return Padding(
          padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
          child: DashboardSurfaceCard(
            child: Directionality(
              textDirection: textDirection,
              child: Column(
                crossAxisAlignment: textDirection == TextDirection.rtl
                    ? CrossAxisAlignment.end
                    : CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    textAlign: textDirection == TextDirection.rtl
                        ? TextAlign.right
                        : TextAlign.left,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  if (isListField) ...[
                    SizedBox(height: context.dashSpacing * 0.25),
                    Text(
                      listHint,
                      textAlign: textDirection == TextDirection.rtl
                          ? TextAlign.right
                          : TextAlign.left,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textMuted,
                      ),
                    ),
                  ],
                  SizedBox(height: context.dashSpacing * 0.45),
                  TextField(
                    controller: controller,
                    maxLines: isListField ? 5 : (fieldId == 'executive_summary' ? 6 : 4),
                    textDirection: textDirection,
                    textAlign: textDirection == TextDirection.rtl
                        ? TextAlign.right
                        : TextAlign.left,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
