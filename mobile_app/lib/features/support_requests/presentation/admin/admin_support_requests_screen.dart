import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/models/admin_assignments_models.dart';
import '../../../dashboard/widgets/admin_page_scaffold.dart';
import '../../../dashboard/widgets/admin_ui_components.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../models/support_request_models.dart';
import '../../providers/admin_support_requests_provider.dart';
import '../support_request_localization_utils.dart';
import '../widgets/support_request_status_chip.dart';

class AdminSupportRequestsScreen extends ConsumerStatefulWidget {
  const AdminSupportRequestsScreen({super.key});

  @override
  ConsumerState<AdminSupportRequestsScreen> createState() =>
      _AdminSupportRequestsScreenState();
}

class _AdminSupportRequestsScreenState
    extends ConsumerState<AdminSupportRequestsScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminSupportRequestsProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 240) {
      ref.read(adminSupportRequestsProvider.notifier).loadMore();
    }
  }

  Future<void> _refresh() async {
    await ref.read(adminSupportRequestsProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminSupportRequestsProvider);
    final notifier = ref.read(adminSupportRequestsProvider.notifier);
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: l10n.supportRequestAdminTitle,
      showBackButton: true,
      currentNav: DashboardNavItem.more,
      actions: [
        if (state.hasActiveFilters)
          IconButton(
            tooltip: l10n.adminClearFilters,
            onPressed: notifier.clearFilters,
            icon: const Icon(Icons.filter_alt_off_outlined, color: Colors.white),
          ),
        IconButton(
          tooltip: l10n.commonRefresh,
          onPressed: state.isInitialLoading ? null : _refresh,
          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
        ),
      ],
      body: state.isInitialLoading && state.items.isEmpty
          ? AdminLoadingCard(message: l10n.supportRequestLoading)
          : RefreshIndicator(
              onRefresh: _refresh,
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverPadding(
                    padding: context.dashPadding,
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        Text(
                          l10n.supportRequestAdminDescription,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _FilterChip(
                              label: state.selectedStatus == null
                                  ? l10n.supportRequestAllStatuses
                                  : localizedSupportRequestStatusLabel(
                                      l10n,
                                      state.selectedStatus!,
                                    ),
                              onSelected: () async {
                                final selected =
                                    await showModalBottomSheet<SupportRequestStatus?>(
                                  context: context,
                                  builder: (context) => _StatusFilterSheet(
                                    selected: state.selectedStatus,
                                  ),
                                );
                                if (selected != null || state.selectedStatus != null) {
                                  notifier.setStatusFilter(selected);
                                }
                              },
                            ),
                            _FilterChip(
                              label: state.selectedCategory == null
                                  ? l10n.supportRequestAllCategories
                                  : localizedSupportRequestCategoryLabel(
                                      l10n,
                                      state.selectedCategory!,
                                    ),
                              onSelected: () async {
                                final selected =
                                    await showModalBottomSheet<SupportRequestCategory?>(
                                  context: context,
                                  builder: (context) => _CategoryFilterSheet(
                                    selected: state.selectedCategory,
                                  ),
                                );
                                if (selected != null || state.selectedCategory != null) {
                                  notifier.setCategoryFilter(selected);
                                }
                              },
                            ),
                            _FilterChip(
                              label: state.selectedSpecialistId == null
                                  ? l10n.supportRequestAllSpecialists
                                  : state.specialists
                                        .firstWhere(
                                          (s) =>
                                              s.userId == state.selectedSpecialistId,
                                          orElse: () => const SpecialistUserOption(
                                            userId: '',
                                            name: '',
                                          ),
                                        )
                                        .name,
                              onSelected: () async {
                                final selected =
                                    await showModalBottomSheet<String?>(
                                  context: context,
                                  builder: (context) => _SpecialistFilterSheet(
                                    specialists: state.specialists,
                                    selectedId: state.selectedSpecialistId,
                                  ),
                                );
                                if (selected != null ||
                                    state.selectedSpecialistId != null) {
                                  notifier.setSpecialistFilter(
                                    selected?.isEmpty == true ? null : selected,
                                  );
                                }
                              },
                            ),
                          ],
                        ),
                        SizedBox(height: context.dashSpacing),
                        if (state.errorMessage != null)
                          AdminErrorCard(
                            message: mapSupportRequestError(
                              l10n,
                              state.errorMessage!,
                            ),
                            onRetry: _refresh,
                          ),
                        if (state.isRefreshing)
                          const Padding(
                            padding: EdgeInsets.only(bottom: 12),
                            child: LinearProgressIndicator(),
                          ),
                        if (state.items.isEmpty)
                          AdminEmptyCard(
                            message: state.hasActiveFilters
                                ? l10n.supportRequestNoMatch
                                : l10n.supportRequestEmpty,
                          )
                        else
                          ...state.items.map(
                            (item) => Padding(
                              padding: EdgeInsets.only(
                                bottom: context.dashSpacing * 0.55,
                              ),
                              child: _AdminSupportRequestCard(
                                item: item,
                                onTap: () => context.push(
                                  AppRoutes.adminSupportRequestDetail(item.id),
                                ),
                              ),
                            ),
                          ),
                        if (state.isLoadingMore)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Center(child: CircularProgressIndicator()),
                          ),
                        if (state.loadMoreErrorMessage != null)
                          AdminErrorCard(
                            message: state.loadMoreErrorMessage!,
                            onRetry: notifier.loadMore,
                          ),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _AdminSupportRequestCard extends StatelessWidget {
  const _AdminSupportRequestCard({required this.item, required this.onTap});

  final SupportRequestItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final activityLabel = item.lastMessageAt == null
        ? l10n.supportRequestDateUnavailable
        : DateFormat.yMMMd().add_jm().format(item.lastMessageAt!);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  item.subject,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              SupportRequestStatusChip(status: item.status),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(l10n.supportRequestSpecialistLabel(item.specialist.fullName)),
          Text(
            localizedSupportRequestCategoryLabel(l10n, item.category),
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            l10n.supportRequestLastActivity(activityLabel),
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.onSelected});

  final String label;
  final VoidCallback onSelected;

  @override
  Widget build(BuildContext context) {
    return ActionChip(label: Text(label), onPressed: onSelected);
  }
}

class _StatusFilterSheet extends StatelessWidget {
  const _StatusFilterSheet({required this.selected});

  final SupportRequestStatus? selected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text(l10n.supportRequestAllStatuses),
            trailing: selected == null ? const Icon(Icons.check_rounded) : null,
            onTap: () => Navigator.pop(context, null),
          ),
          ...SupportRequestStatus.values.map(
            (status) => ListTile(
              title: Text(localizedSupportRequestStatusLabel(l10n, status)),
              trailing: selected == status ? const Icon(Icons.check_rounded) : null,
              onTap: () => Navigator.pop(context, status),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryFilterSheet extends StatelessWidget {
  const _CategoryFilterSheet({required this.selected});

  final SupportRequestCategory? selected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text(l10n.supportRequestAllCategories),
            trailing: selected == null ? const Icon(Icons.check_rounded) : null,
            onTap: () => Navigator.pop(context, null),
          ),
          ...SupportRequestCategory.values.map(
            (category) => ListTile(
              title: Text(localizedSupportRequestCategoryLabel(l10n, category)),
              trailing:
                  selected == category ? const Icon(Icons.check_rounded) : null,
              onTap: () => Navigator.pop(context, category),
            ),
          ),
        ],
      ),
    );
  }
}

class _SpecialistFilterSheet extends StatelessWidget {
  const _SpecialistFilterSheet({
    required this.specialists,
    required this.selectedId,
  });

  final List<SpecialistUserOption> specialists;
  final String? selectedId;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text(l10n.supportRequestAllSpecialists),
            trailing: selectedId == null ? const Icon(Icons.check_rounded) : null,
            onTap: () => Navigator.pop(context, ''),
          ),
          ...specialists.map(
            (specialist) => ListTile(
              title: Text(specialist.name),
              trailing: selectedId == specialist.userId
                  ? const Icon(Icons.check_rounded)
                  : null,
              onTap: () => Navigator.pop(context, specialist.userId),
            ),
          ),
        ],
      ),
    );
  }
}
