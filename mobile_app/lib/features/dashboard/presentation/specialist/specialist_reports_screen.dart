import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../providers/specialist_reports_provider.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_reports_widgets.dart';

class SpecialistReportsScreen extends ConsumerStatefulWidget {
  const SpecialistReportsScreen({super.key});

  @override
  ConsumerState<SpecialistReportsScreen> createState() =>
      _SpecialistReportsScreenState();
}

class _SpecialistReportsScreenState extends ConsumerState<SpecialistReportsScreen> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistReportsProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistReportsProvider);
    final notifier = ref.read(specialistReportsProvider.notifier);
    final visible = state.visibleReports;

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && state.reports.isEmpty) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.refresh,
        ),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.primary,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            buildReportSearchField(
              controller: _searchController,
              onChanged: notifier.setSearchQuery,
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            SpecialistReportFilterChips(
              selected: state.filter,
              onChanged: notifier.setFilter,
            ),
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: notifier.refresh,
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.75),
            if (state.reports.isEmpty)
              const DashboardEmptyCard(message: 'No reports found.')
            else if (visible.isEmpty)
              const DashboardEmptyCard(
                message: 'No reports match your search or filter.',
              )
            else
              ...visible.map(
                (report) => SpecialistReportCard(
                  report: report,
                  onTap: () => context.push(
                    AppRoutes.specialistReportDetails(
                      report.id,
                      isAi: report.isAiReport,
                    ),
                  ),
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Reports',
      currentNav: DashboardNavItem.reports,
      body: body,
    );
  }
}
