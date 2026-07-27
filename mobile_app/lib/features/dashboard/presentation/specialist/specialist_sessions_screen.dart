import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../providers/specialist_session_requests_provider.dart';
import '../../providers/specialist_sessions_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_session_requests_widgets.dart';
import 'specialist_sessions_widgets.dart';

enum _SpecialistSessionsSection { sessions, requests }

class SpecialistSessionsScreen extends ConsumerStatefulWidget {
  const SpecialistSessionsScreen({super.key});

  @override
  ConsumerState<SpecialistSessionsScreen> createState() =>
      _SpecialistSessionsScreenState();
}

class _SpecialistSessionsScreenState
    extends ConsumerState<SpecialistSessionsScreen> {
  late final TextEditingController _searchController;
  _SpecialistSessionsSection _selectedSection = _SpecialistSessionsSection.sessions;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistSessionsProvider.notifier).initialize();
      ref.read(specialistSessionRequestsProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _refreshAll() async {
    await Future.wait([
      ref.read(specialistSessionsProvider.notifier).refresh(),
      ref.read(specialistSessionRequestsProvider.notifier).refresh(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final sessionsState = ref.watch(specialistSessionsProvider);
    final sessionsNotifier = ref.read(specialistSessionsProvider.notifier);
    final visible = sessionsState.visibleSessions;

    Widget body;
    if (_selectedSection == _SpecialistSessionsSection.requests) {
      body = RefreshIndicator(
        onRefresh: _refreshAll,
        color: DashboardColors.primary,
        child: const SpecialistSessionRequestsInbox(),
      );
    } else if (sessionsState.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (sessionsState.errorMessage != null &&
        sessionsState.sessions.isEmpty) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: sessionsState.errorMessage!,
          onRetry: _refreshAll,
        ),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: _refreshAll,
        color: DashboardColors.primary,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            buildSessionSearchField(
              controller: _searchController,
              onChanged: sessionsNotifier.setSearchQuery,
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            SessionFilterChips(
              selected: sessionsState.filter,
              onChanged: sessionsNotifier.setFilter,
            ),
            if (sessionsState.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: sessionsState.errorMessage!,
                onRetry: _refreshAll,
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.75),
            if (sessionsState.sessions.isEmpty)
              const DashboardEmptyCard(message: 'No sessions found.')
            else if (visible.isEmpty)
              const DashboardEmptyCard(
                message: 'No sessions match your search or filter.',
              )
            else
              ...visible.map(
                (session) => SpecialistSessionCard(
                  session: session,
                  onTap: session.id.isEmpty
                      ? null
                      : () => context.push(
                            AppRoutes.specialistSessionDetails(session.id),
                          ),
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Sessions',
      showBackButton: true,
      floatingActionButton: _selectedSection == _SpecialistSessionsSection.sessions
          ? FloatingActionButton.extended(
              onPressed: () async {
                final created = await context.push<bool>(
                  AppRoutes.specialistCreateSession,
                );
                if (created == true && mounted) {
                  await _refreshAll();
                }
              },
              backgroundColor: DashboardColors.primary,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Schedule Session'),
            )
          : null,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: context.dashPadding.copyWith(bottom: 0),
            child: _SpecialistSessionsSectionTabs(
              selectedSection: _selectedSection,
              onChanged: (section) => setState(() => _selectedSection = section),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          Expanded(child: body),
        ],
      ),
    );
  }
}

class _SpecialistSessionsSectionTabs extends StatelessWidget {
  const _SpecialistSessionsSectionTabs({
    required this.selectedSection,
    required this.onChanged,
  });

  final _SpecialistSessionsSection selectedSection;
  final ValueChanged<_SpecialistSessionsSection> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.18),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.8)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _SectionTabButton(
              label: 'Sessions',
              icon: Icons.event_available_outlined,
              isSelected: selectedSection == _SpecialistSessionsSection.sessions,
              onTap: () => onChanged(_SpecialistSessionsSection.sessions),
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.25),
          Expanded(
            child: _SectionTabButton(
              label: 'Requests',
              icon: Icons.inbox_outlined,
              isSelected: selectedSection == _SpecialistSessionsSection.requests,
              onTap: () => onChanged(_SpecialistSessionsSection.requests),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTabButton extends StatelessWidget {
  const _SectionTabButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: isSelected ? DashboardColors.purpleSoft : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: EdgeInsets.symmetric(
              vertical: context.dashSpacing * 0.45,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: isSelected
                      ? DashboardColors.primary
                      : DashboardColors.textMuted,
                ),
                SizedBox(width: context.dashSpacing * 0.25),
                Text(
                  label,
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: isSelected
                        ? DashboardColors.primary
                        : DashboardColors.textSecondary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
