import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/admin_page_scaffold.dart';
import '../../../dashboard/widgets/admin_ui_components.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../models/case_category_model.dart';
import '../../models/case_intake_request_model.dart';
import '../../providers/admin_case_inbox_provider.dart';
import '../../providers/case_categories_provider.dart';
import '../../widgets/admin_case_inbox_card.dart';

class AdminCaseInboxScreen extends ConsumerStatefulWidget {
  const AdminCaseInboxScreen({super.key});

  @override
  ConsumerState<AdminCaseInboxScreen> createState() =>
      _AdminCaseInboxScreenState();
}

class _AdminCaseInboxScreenState extends ConsumerState<AdminCaseInboxScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminCaseInboxProvider.notifier).initialize();
    });
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) {
      return;
    }
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 240) {
      ref.read(adminCaseInboxProvider.notifier).loadMore();
    }
  }

  Future<void> _onRefresh() async {
    await ref.read(adminCaseInboxProvider.notifier).refresh();
    final error = ref.read(adminCaseInboxProvider).errorMessage;
    if (error != null && error.isNotEmpty && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  Future<void> _onCardTap(String requestId) async {
    await context.push(AppRoutes.adminCaseRequestDetail(requestId));
    if (!mounted) {
      return;
    }
    await ref.read(adminCaseInboxProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminCaseInboxProvider);
    final categoriesState = ref.watch(caseCategoriesProvider);
    final theme = Theme.of(context);
    final notifier = ref.read(adminCaseInboxProvider.notifier);

    if (state.searchText.isEmpty && _searchController.text.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted &&
            ref.read(adminCaseInboxProvider).searchText.isEmpty &&
            _searchController.text.isNotEmpty) {
          _searchController.clear();
        }
      });
    }

    final l10n = AppLocalizations.of(context)!;

    return AdminPageScaffold(
      title: l10n.navCaseRequests,
      showBackButton: true,
      currentNav: DashboardNavItem.more,
      actions: [
        if (state.hasActiveFilters)
          IconButton(
            tooltip: l10n.adminClearFilters,
            onPressed: notifier.clearFilters,
            icon: const Icon(
              Icons.filter_alt_off_outlined,
              color: Colors.white,
            ),
          ),
        IconButton(
          tooltip: l10n.commonRefresh,
          onPressed: state.isInitialLoading ? null : _onRefresh,
          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
        ),
      ],
      body: state.isInitialLoading && state.items.isEmpty
          ? AdminLoadingCard(message: l10n.parentDashboardCaseIntakeLoading)
          : RefreshIndicator(
              onRefresh: _onRefresh,
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverPadding(
                    padding: context.dashPadding,
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        Text(
                          l10n.adminCaseRequestsDescription,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing),
                        TextField(
                          controller: _searchController,
                          textInputAction: TextInputAction.search,
                          onChanged: notifier.setSearchText,
                          decoration: InputDecoration(
                            labelText: l10n.adminCaseRequestsSearchLabel,
                            hintText: l10n.adminCaseRequestsSearchHint,
                            prefixIcon: const Icon(Icons.search_rounded),
                            suffixIcon: state.searchText.isNotEmpty
                                ? IconButton(
                                    tooltip: l10n.adminCaseRequestsClearSearch,
                                    onPressed: () {
                                      _searchController.clear();
                                      notifier.setSearchText('');
                                    },
                                    icon: const Icon(Icons.clear_rounded),
                                  )
                                : null,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.75),
                        _FilterDropdowns(
                          selectedStatus: state.selectedStatus,
                          selectedCategoryId: state.selectedCategoryId,
                          categoriesLoading:
                              categoriesState.isLoading &&
                              categoriesState.categories.isEmpty,
                          categories: categoriesState.categories,
                          onStatusChanged: notifier.setStatusFilter,
                          onCategoryChanged: notifier.setCategoryFilter,
                        ),
                        if (state.hasActiveFilters) ...[
                          SizedBox(height: context.dashSpacing * 0.35),
                          Align(
                            alignment: AlignmentDirectional.centerEnd,
                            child: TextButton.icon(
                              onPressed: notifier.clearFilters,
                              icon: const Icon(
                                Icons.filter_alt_off_outlined,
                                size: 18,
                              ),
                              label: Text(l10n.adminCaseRequestsClearFilters),
                            ),
                          ),
                        ],
                        SizedBox(height: context.dashSpacing),
                        if (state.errorMessage != null &&
                            state.items.isEmpty) ...[
                          AdminErrorCard(
                            message: state.errorMessage!,
                            onRetry: notifier.retry,
                          ),
                          SizedBox(height: context.dashSpacing),
                        ],
                        if (state.errorMessage != null &&
                            state.items.isNotEmpty) ...[
                          AdminErrorCard(
                            message: state.errorMessage!,
                            onRetry: notifier.refresh,
                          ),
                          SizedBox(height: context.dashSpacing * 0.75),
                        ],
                        if (state.isRefreshing)
                          const Padding(
                            padding: EdgeInsets.only(bottom: 12),
                            child: LinearProgressIndicator(),
                          ),
                        if (!state.isInitialLoading &&
                            state.items.isEmpty &&
                            state.errorMessage == null)
                          AdminEmptyCard(
                            message: state.hasActiveFilters
                                ? l10n.adminCaseRequestsNoMatch
                                : l10n.adminCaseRequestsEmpty,
                          ),
                        if (!state.isInitialLoading &&
                            state.items.isEmpty &&
                            state.hasActiveFilters) ...[
                          SizedBox(height: context.dashSpacing * 0.5),
                          OutlinedButton(
                            onPressed: notifier.clearFilters,
                            child: Text(l10n.adminCaseRequestsClearFilters),
                          ),
                        ],
                      ]),
                    ),
                  ),
                  if (state.items.isNotEmpty)
                    SliverPadding(
                      padding: EdgeInsets.fromLTRB(
                        context.dashPadding.left,
                        0,
                        context.dashPadding.right,
                        context.dashSpacing,
                      ),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final item = state.items[index];
                          return AdminCaseInboxCard(
                            item: item,
                            onTap: () => _onCardTap(item.id),
                          );
                        }, childCount: state.items.length),
                      ),
                    ),
                  if (state.isLoadingMore)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.only(bottom: 24),
                        child: Center(
                          child: SizedBox(
                            width: 28,
                            height: 28,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                        ),
                      ),
                    ),
                  if (state.loadMoreErrorMessage != null)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(
                          context.dashPadding.left,
                          0,
                          context.dashPadding.right,
                          context.dashSpacing,
                        ),
                        child: Column(
                          children: [
                            Text(
                              state.loadMoreErrorMessage!,
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.highPriority,
                              ),
                            ),
                            TextButton(
                              onPressed: notifier.retryLoadMore,
                              child: Text(l10n.commonRetry),
                            ),
                          ],
                        ),
                      ),
                    ),
                  SliverToBoxAdapter(
                    child: SizedBox(height: context.dashSpacing),
                  ),
                ],
              ),
            ),
    );
  }
}

class _FilterDropdowns extends StatelessWidget {
  const _FilterDropdowns({
    required this.selectedStatus,
    required this.selectedCategoryId,
    required this.categoriesLoading,
    required this.categories,
    required this.onStatusChanged,
    required this.onCategoryChanged,
  });

  final CaseIntakeStatus? selectedStatus;
  final String? selectedCategoryId;
  final bool categoriesLoading;
  final List<CaseCategory> categories;
  final ValueChanged<CaseIntakeStatus?> onStatusChanged;
  final ValueChanged<String?> onCategoryChanged;

  static List<(CaseIntakeStatus?, String)> _statusOptions(
    AppLocalizations l10n,
  ) {
    return [
      (null, l10n.adminCaseRequestsAllStatuses),
      (CaseIntakeStatus.pending, l10n.statusPending),
      (CaseIntakeStatus.assigned, l10n.statusAssigned),
      (CaseIntakeStatus.underAssessment, l10n.statusUnderAssessment),
      (CaseIntakeStatus.accepted, l10n.statusAccepted),
      (CaseIntakeStatus.rejected, l10n.statusRejected),
      (
        CaseIntakeStatus.convertedToPatient,
        l10n.adminCaseRequestsConvertedToPatient,
      ),
    ];
  }

  InputDecoration _decoration(String label) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: DashboardColors.surface,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: DashboardColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: DashboardColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(
          color: DashboardColors.brandCyan,
          width: 1.5,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final statusOptions = _statusOptions(l10n);
    final statusField = DropdownButtonFormField<CaseIntakeStatus?>(
      key: ValueKey('status-${selectedStatus?.apiValue ?? 'all'}'),
      isExpanded: true,
      initialValue: selectedStatus,
      decoration: _decoration(l10n.adminFieldStatus),
      items: statusOptions
          .map(
            (option) => DropdownMenuItem<CaseIntakeStatus?>(
              value: option.$1,
              child: Text(
                option.$2,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      selectedItemBuilder: (context) => statusOptions
          .map(
            (option) => Align(
              alignment: AlignmentDirectional.centerStart,
              child: Text(
                option.$2,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: onStatusChanged,
    );

    final categoryField = categoriesLoading
        ? const Padding(
            padding: EdgeInsets.symmetric(vertical: 8),
            child: LinearProgressIndicator(),
          )
        : DropdownButtonFormField<String?>(
            key: ValueKey('category-${selectedCategoryId ?? 'all'}'),
            isExpanded: true,
            initialValue: selectedCategoryId,
            decoration: _decoration(l10n.adminFieldCategory),
            items: [
              DropdownMenuItem<String?>(
                value: null,
                child: Text(
                  l10n.adminCaseRequestsAllCategories,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              ...categories.map(
                (category) => DropdownMenuItem<String?>(
                  value: category.id,
                  child: Text(
                    category.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
            selectedItemBuilder: (context) {
              final labels = <String>[
                l10n.adminCaseRequestsAllCategories,
                ...categories.map((category) => category.name),
              ];
              return labels
                  .map(
                    (label) => Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: Text(
                        label,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  )
                  .toList();
            },
            onChanged: onCategoryChanged,
          );

    return LayoutBuilder(
      builder: (context, constraints) {
        final sideBySide = constraints.maxWidth >= 520;
        if (sideBySide) {
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: statusField),
              SizedBox(width: context.dashSpacing * 0.65),
              Expanded(child: categoryField),
            ],
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            statusField,
            SizedBox(height: context.dashSpacing * 0.65),
            categoryField,
          ],
        );
      },
    );
  }
}
