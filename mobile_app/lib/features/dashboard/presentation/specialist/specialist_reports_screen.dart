import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/specialist_page_scaffold.dart';
import '../shared/reports_list_widgets.dart';

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

    return SpecialistPageScaffold(
      title: scoped ? l10n.specialistPatientReports : l10n.navReports,
      showBackButton: scoped,
      currentNav: scoped ? null : DashboardNavItem.reports,
      body: ReportsListBody(
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
    );
  }
}
