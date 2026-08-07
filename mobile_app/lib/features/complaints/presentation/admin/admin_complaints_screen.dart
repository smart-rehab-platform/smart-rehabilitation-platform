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
import '../../models/complaint_models.dart';
import '../../providers/admin_complaints_provider.dart';
import '../complaint_localization_utils.dart';
import '../widgets/complaint_status_chip.dart';

class AdminComplaintsScreen extends ConsumerStatefulWidget {
  const AdminComplaintsScreen({super.key});

  @override
  ConsumerState<AdminComplaintsScreen> createState() =>
      _AdminComplaintsScreenState();
}

class _AdminComplaintsScreenState extends ConsumerState<AdminComplaintsScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminComplaintsProvider.notifier).initialize();
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
      ref.read(adminComplaintsProvider.notifier).loadMore();
    }
  }

  Future<void> _refresh() async {
    await ref.read(adminComplaintsProvider.notifier).refresh();
  }

  Future<void> _pickDateRange() async {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.read(adminComplaintsProvider);
    final now = DateTime.now();
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 2),
      lastDate: now,
      initialDateRange: state.fromDate != null && state.toDate != null
          ? DateTimeRange(start: state.fromDate!, end: state.toDate!)
          : null,
      helpText: l10n.adminComplaintsDateRange,
    );
    if (range == null) return;
    ref.read(adminComplaintsProvider.notifier).setDateRange(
      from: range.start,
      to: DateTime(
        range.end.year,
        range.end.month,
        range.end.day,
        23,
        59,
        59,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminComplaintsProvider);
    final notifier = ref.read(adminComplaintsProvider.notifier);
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: l10n.adminComplaintsTitle,
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
          ? AdminLoadingCard(message: l10n.adminComplaintsLoading)
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
                          l10n.adminComplaintsDescription,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _FilterChip<ComplaintStatus?>(
                              label: state.selectedStatus == null
                                  ? l10n.adminComplaintsAllStatuses
                                  : localizedComplaintStatusLabel(
                                      l10n,
                                      state.selectedStatus!,
                                    ),
                              onSelected: () async {
                                final selected = await showModalBottomSheet<
                                    ComplaintStatus?>(
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
                            _FilterChip<ComplaintCategory?>(
                              label: state.selectedCategory == null
                                  ? l10n.adminComplaintsAllCategories
                                  : localizedComplaintCategoryLabel(
                                      l10n,
                                      state.selectedCategory!,
                                    ),
                              onSelected: () async {
                                final selected = await showModalBottomSheet<
                                    ComplaintCategory?>(
                                  context: context,
                                  builder: (context) => _CategoryFilterSheet(
                                    selected: state.selectedCategory,
                                  ),
                                );
                                if (selected != null ||
                                    state.selectedCategory != null) {
                                  notifier.setCategoryFilter(selected);
                                }
                              },
                            ),
                            _FilterChip<String?>(
                              label: state.selectedSpecialistId == null
                                  ? l10n.adminComplaintsAllSpecialists
                                  : state.specialists
                                        .firstWhere(
                                          (s) =>
                                              s.userId ==
                                              state.selectedSpecialistId,
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
                                  builder: (context) =>
                                      _SpecialistFilterSheet(
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
                            ActionChip(
                              avatar: const Icon(Icons.date_range_outlined, size: 18),
                              label: Text(
                                state.fromDate != null && state.toDate != null
                                    ? l10n.adminComplaintsDateRangeSelected
                                    : l10n.adminComplaintsDateRange,
                              ),
                              onPressed: _pickDateRange,
                            ),
                          ],
                        ),
                        SizedBox(height: context.dashSpacing),
                        if (state.errorMessage != null)
                          AdminErrorCard(
                            message: mapAdminComplaintError(
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
                                ? l10n.adminComplaintsNoMatch
                                : l10n.adminComplaintsEmpty,
                          )
                        else
                          ...state.items.map(
                            (item) => Padding(
                              padding: EdgeInsets.only(
                                bottom: context.dashSpacing * 0.55,
                              ),
                              child: _AdminComplaintCard(
                                complaint: item,
                                onTap: () => context.push(
                                  AppRoutes.adminComplaintDetail(item.id),
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

class _AdminComplaintCard extends StatelessWidget {
  const _AdminComplaintCard({required this.complaint, required this.onTap});

  final ComplaintItem complaint;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dateLabel = complaint.createdAt == null
        ? l10n.complaintDateUnavailable
        : DateFormat.yMMMd().format(complaint.createdAt!);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  localizedComplaintCategoryLabel(l10n, complaint.category),
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              ComplaintStatusChip(status: complaint.status),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(l10n.adminComplaintsParentLabel(complaint.parent.fullName)),
          Text(l10n.adminComplaintsChildLabel(complaint.patient.fullName)),
          Text(l10n.adminComplaintsSpecialistLabel(complaint.specialist.fullName)),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            dateLabel,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip<T> extends StatelessWidget {
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

  final ComplaintStatus? selected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text(l10n.adminComplaintsAllStatuses),
            trailing: selected == null ? const Icon(Icons.check_rounded) : null,
            onTap: () => Navigator.pop(context, null),
          ),
          ...ComplaintStatus.values.map(
            (status) => ListTile(
              title: Text(localizedComplaintStatusLabel(l10n, status)),
              trailing: selected == status
                  ? const Icon(Icons.check_rounded)
                  : null,
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

  final ComplaintCategory? selected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            title: Text(l10n.adminComplaintsAllCategories),
            trailing: selected == null ? const Icon(Icons.check_rounded) : null,
            onTap: () => Navigator.pop(context, null),
          ),
          ...ComplaintCategory.values.map(
            (category) => ListTile(
              title: Text(localizedComplaintCategoryLabel(l10n, category)),
              trailing: selected == category
                  ? const Icon(Icons.check_rounded)
                  : null,
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
            title: Text(l10n.adminComplaintsAllSpecialists),
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
