import 'package:flutter/material.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_patient_details_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';

String _formatDiagnosedDate(BuildContext context, DateTime? date) {
  if (date == null) {
    return '—';
  }
  final locale = Localizations.localeOf(context).toString();
  return DateFormat.yMMMd(locale).format(date);
}

class PatientDiagnosisSection extends StatelessWidget {
  const PatientDiagnosisSection({
    super.key,
    required this.diagnoses,
  });

  final List<PatientDiagnosisItem> diagnoses;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final current = diagnoses.isNotEmpty ? diagnoses.first : null;
    final history = diagnoses.length > 1 ? diagnoses.sublist(1) : const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          l10n.specialistPatientDetailsDiagnosisSectionTitle,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.5),
        Text(
          l10n.specialistPatientDetailsCurrentDiagnosis,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
            color: DashboardColors.textSecondary,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        if (current == null)
          DashboardSurfaceCard(
            child: Text(
              l10n.specialistPatientDetailsNoDiagnosis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          )
        else
          DashboardSurfaceCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  current.title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.25),
                Text(
                  l10n.specialistPatientDetailsDiagnosedOn(
                    _formatDiagnosedDate(context, current.diagnosedAt),
                  ),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
                if (current.description?.trim().isNotEmpty == true) ...[
                  SizedBox(height: context.dashSpacing * 0.35),
                  Text(
                    current.description!.trim(),
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                ],
                if (current.diagnosedByName?.trim().isNotEmpty == true) ...[
                  SizedBox(height: context.dashSpacing * 0.25),
                  Text(
                    l10n.specialistPatientDetailsDiagnosedBy(
                      current.diagnosedByName!.trim(),
                    ),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        if (history.isNotEmpty) ...[
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            l10n.specialistPatientDetailsDiagnosisHistory,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w600,
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          ...history.map(
            (item) => Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.45),
              child: DashboardSurfaceCard(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            item.title,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: DashboardColors.textPrimary,
                            ),
                          ),
                          if (item.description?.trim().isNotEmpty == true) ...[
                            SizedBox(height: context.dashSpacing * 0.15),
                            Text(
                              item.description!.trim(),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            ),
                          ],
                          if (item.diagnosedByName?.trim().isNotEmpty ==
                              true) ...[
                            SizedBox(height: context.dashSpacing * 0.15),
                            Text(
                              l10n.specialistPatientDetailsDiagnosedBy(
                                item.diagnosedByName!.trim(),
                              ),
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.5),
                    Text(
                      _formatDiagnosedDate(context, item.diagnosedAt),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                      textDirection: TextDirection.ltr,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
