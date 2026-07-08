import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../providers/specialist_sessions_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_sessions_widgets.dart';

class SpecialistSessionsScreen extends ConsumerStatefulWidget {
  const SpecialistSessionsScreen({super.key});

  @override
  ConsumerState<SpecialistSessionsScreen> createState() =>
      _SpecialistSessionsScreenState();
}

class _SpecialistSessionsScreenState
    extends ConsumerState<SpecialistSessionsScreen> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistSessionsProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistSessionsProvider);
    final notifier = ref.read(specialistSessionsProvider.notifier);
    final visible = state.visibleSessions;

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && state.sessions.isEmpty) {
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
            buildSessionSearchField(
              controller: _searchController,
              onChanged: notifier.setSearchQuery,
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            SessionFilterChips(
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
            if (state.sessions.isEmpty)
              const DashboardEmptyCard(message: 'No sessions found.')
            else if (visible.isEmpty)
              const DashboardEmptyCard(
                message: 'No sessions match your search or filter.',
              )
            else
              ...visible.map(
                (session) => SpecialistSessionCard(
                  session: session,
                  onTap: session.patientId.isEmpty
                      ? null
                      : () => context.push(
                            AppRoutes.specialistPatientDetails(session.patientId),
                          ),
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: "Today's Sessions",
      showBackButton: true,
      body: body,
    );
  }
}
