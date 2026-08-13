import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../shared/reports_list_widgets.dart';
import 'specialist_create_report_sheet.dart';
import 'specialist_generate_ai_report_sheet.dart';

class SpecialistReportsScreen extends ConsumerStatefulWidget {
  const SpecialistReportsScreen({super.key, this.patientId});

  /// When set, the list is scoped to this patient only.
  final String? patientId;

  @override
  ConsumerState<SpecialistReportsScreen> createState() =>
      _SpecialistReportsScreenState();
}

class _SpecialistReportsScreenState
    extends ConsumerState<SpecialistReportsScreen> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistReportsProvider(widget.patientId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scoped = widget.patientId != null && widget.patientId!.isNotEmpty;
    final l10n = AppLocalizations.of(context)!;

    final title = scoped ? l10n.specialistPatientReports : l10n.navReports;

    return SpecialistPageScaffold(
      title: title,
      showBackButton: scoped,
      currentNav: scoped ? null : DashboardNavItem.reports,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              context.dashPadding.left,
              context.dashSpacing * 0.15,
              context.dashPadding.right,
              0,
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final titleStyle = Theme.of(context).textTheme.titleLarge
                    ?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: DashboardColors.textPrimary,
                    );
                final stacked =
                    constraints.maxWidth < 420 ||
                    MediaQuery.textScalerOf(context).scale(1) > 1.3;

                final titleText = Text(title, style: titleStyle);
                final createButton = Tooltip(
                  message: l10n.specialistCreateReport,
                  child: Semantics(
                    button: true,
                    label: l10n.specialistCreateReport,
                    child: OutlinedButton.icon(
                      onPressed: () => showSpecialistCreateReportSheet(
                        context: context,
                        ref: ref,
                        reportsPatientId: widget.patientId,
                      ),
                      icon: const Icon(Icons.note_add_outlined, size: 16),
                      label: Text(l10n.commonCreate),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: DashboardColors.textPrimary,
                        side: const BorderSide(color: DashboardColors.border),
                        visualDensity: VisualDensity.compact,
                        minimumSize: const Size(0, 40),
                        padding: EdgeInsetsDirectional.only(
                          start: context.dashSpacing * 0.45,
                          end: context.dashSpacing * 0.55,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),
                  ),
                );
                final generateButton = Tooltip(
                  message: l10n.specialistGenerateAiReport,
                  child: FilledButton.icon(
                    onPressed: () => showSpecialistGenerateAiReportSheet(
                      context: context,
                      ref: ref,
                      reportsPatientId: widget.patientId,
                    ),
                    icon: const Icon(Icons.auto_awesome_outlined, size: 16),
                    label: Text(l10n.commonGenerate),
                    style: FilledButton.styleFrom(
                      backgroundColor: DashboardColors.brandCyan,
                      foregroundColor: Colors.white,
                      visualDensity: VisualDensity.compact,
                      minimumSize: const Size(0, 40),
                      padding: EdgeInsetsDirectional.only(
                        start: context.dashSpacing * 0.45,
                        end: context.dashSpacing * 0.55,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ),
                );
                final actions = Wrap(
                  spacing: context.dashSpacing * 0.4,
                  runSpacing: context.dashSpacing * 0.35,
                  alignment: stacked
                      ? WrapAlignment.start
                      : WrapAlignment.end,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [createButton, generateButton],
                );

                if (stacked) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      titleText,
                      SizedBox(height: context.dashSpacing * 0.4),
                      actions,
                    ],
                  );
                }

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(child: titleText),
                    SizedBox(width: context.dashSpacing * 0.45),
                    Flexible(
                      child: Align(
                        alignment: AlignmentDirectional.centerEnd,
                        child: actions,
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          Expanded(
            child: ReportsListBody(
              patientId: widget.patientId,
              searchController: _searchController,
              refreshIndicatorColor: DashboardColors.brandCyan,
              onReportTap: (context, report) {
                context.push(
                  AppRoutes.specialistReportDetails(
                    report.id,
                    isAi: report.isAiReport,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
