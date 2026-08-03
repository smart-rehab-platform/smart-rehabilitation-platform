import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../case_intake/models/case_category_model.dart';
import '../../../case_intake/providers/case_categories_provider.dart';
import '../../data/admin_features_repository.dart';
import '../../providers/admin_features_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_status_badge.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';
import 'admin_scoped_localization_utils.dart';

class AdminPatientsScreen extends ConsumerStatefulWidget {
  const AdminPatientsScreen({super.key});

  @override
  ConsumerState<AdminPatientsScreen> createState() =>
      _AdminPatientsScreenState();
}

class _AdminPatientsScreenState extends ConsumerState<AdminPatientsScreen> {
  bool _isLoading = true;
  String? _error;
  List<AdminPatientRecord> _patients = const [];
  String _searchQuery = '';
  String? _conditionFilter;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load();
      ref.read(caseCategoriesProvider.notifier).loadCategories();
    });
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final repo = ref.read(adminFeaturesRepositoryProvider);
      final rows = await repo.fetchPatients();
      if (mounted) {
        setState(() {
          _isLoading = false;
          _patients = rows;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to load patients: $error';
        });
      }
    }
  }

  List<String> _buildConditionFilterOptions(List<CaseCategory> categories) {
    final options = <String>{
      for (final category in categories)
        if (category.name.trim().isNotEmpty) category.name.trim(),
      for (final patient in _patients)
        if (_hasCondition(patient)) patient.condition!.trim(),
    }.toList()..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));

    return options;
  }

  List<AdminPatientRecord> _filteredPatients(String? conditionFilter) {
    final query = _searchQuery.trim().toLowerCase();
    return _patients.where((patient) {
      final matchesSearch =
          query.isEmpty ||
          patient.fullName.toLowerCase().contains(query) ||
          (patient.condition ?? '').toLowerCase().contains(query);
      final matchesCondition =
          conditionFilter == null ||
          conditionFilter.isEmpty ||
          patient.condition == conditionFilter;
      return matchesSearch && matchesCondition;
    }).toList();
  }

  Future<void> _openPatientDetails(String patientId) async {
    final updated = await context.push<bool>(
      AppRoutes.adminPatientDetails(patientId),
    );
    if (!mounted) return;
    if (updated == true) {
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final categoriesState = ref.watch(caseCategoriesProvider);
    final conditionOptions = _buildConditionFilterOptions(
      categoriesState.categories,
    );
    final effectiveConditionFilter =
        _conditionFilter != null && conditionOptions.contains(_conditionFilter)
        ? _conditionFilter
        : null;
    final filteredPatients = _filteredPatients(effectiveConditionFilter);

    return AdminPageScaffold(
      title: l10n.navPatients,
      currentNav: DashboardNavItem.patients,
      actions: [
        IconButton(
          tooltip: l10n.navPatientAssignments,
          onPressed: () => context.push(AppRoutes.adminPatientAssignments),
          icon: const Icon(Icons.assignment_ind_outlined, color: Colors.white),
        ),
      ],
      body: _isLoading
          ? const AdminLoadingCard()
          : SingleChildScrollView(
              padding: context.dashPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_error != null)
                    AdminErrorCard(
                      message: mapAdminPatientsError(l10n, _error!),
                      onRetry: _load,
                    ),
                  AdminSearchField(
                    hintText: l10n.adminPatientsSearchHint,
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  if (categoriesState.isLoading && conditionOptions.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: LinearProgressIndicator(),
                    )
                  else
                    AdminFilterDropdown<String?>(
                      label: l10n.adminPatientsFilterCondition,
                      value: effectiveConditionFilter,
                      options: [
                        AdminFilterOption<String?>(
                          value: null,
                          label: l10n.adminPatientsAllConditions,
                        ),
                        ...conditionOptions.map(
                          (condition) => AdminFilterOption<String?>(
                            value: condition,
                            label: condition,
                          ),
                        ),
                      ],
                      onChanged: (value) =>
                          setState(() => _conditionFilter = value),
                    ),
                  SizedBox(height: context.dashSpacing),
                  if (filteredPatients.isEmpty)
                    AdminEmptyCard(message: l10n.adminPatientsNoPatients)
                  else
                    ...filteredPatients.map(
                      (patient) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.6,
                        ),
                        child: AdminSurfaceCard(
                          onTap: patient.id.isEmpty
                              ? null
                              : () => _openPatientDetails(patient.id),
                          padding: EdgeInsets.symmetric(
                            horizontal: context.dashSpacing * 0.75,
                            vertical: context.dashSpacing * 0.48,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  AdminIconCircle(
                                    icon: Icons.person_outline_rounded,
                                    color: DashboardColors.primary,
                                    background: DashboardColors.blueSoft,
                                    size: 38,
                                    imageUrl: patient.profileImageUrl,
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          patient.fullName,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.titleMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.w800,
                                                color:
                                                    DashboardColors.textPrimary,
                                                height: 1.2,
                                              ),
                                        ),
                                        if (_hasCondition(patient) ||
                                            _hasGender(patient)) ...[
                                          const SizedBox(height: 4),
                                          if (_hasCondition(patient) &&
                                              _hasGender(patient))
                                            Wrap(
                                              crossAxisAlignment:
                                                  WrapCrossAlignment.center,
                                              spacing: 6,
                                              runSpacing: 4,
                                              children: [
                                                AdminStatusBadge(
                                                  label: patient.condition!,
                                                  color:
                                                      DashboardColors.brandCyan,
                                                ),
                                                Text(
                                                  '•',
                                                  style: theme
                                                      .textTheme
                                                      .labelSmall
                                                      ?.copyWith(
                                                        color: DashboardColors
                                                            .textMuted,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                ),
                                                Text(
                                                  localizedAdminGender(
                                                    l10n,
                                                    patient.gender,
                                                  ),
                                                  style: theme
                                                      .textTheme
                                                      .labelSmall
                                                      ?.copyWith(
                                                        color: DashboardColors
                                                            .textMuted,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                ),
                                              ],
                                            )
                                          else if (_hasCondition(patient))
                                            Align(
                                              alignment: AlignmentDirectional
                                                  .centerStart,
                                              child: AdminStatusBadge(
                                                label: patient.condition!,
                                                color:
                                                    DashboardColors.brandCyan,
                                              ),
                                            )
                                          else
                                            Text(
                                              localizedAdminGender(
                                                l10n,
                                                patient.gender,
                                              ),
                                              style: theme.textTheme.labelSmall
                                                  ?.copyWith(
                                                    color: DashboardColors
                                                        .textMuted,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                            ),
                                        ],
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    tooltip: l10n.adminPatientsEditPatient,
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(
                                      minWidth: 36,
                                      minHeight: 36,
                                    ),
                                    onPressed: patient.id.isEmpty
                                        ? null
                                        : () => _openPatientDetails(patient.id),
                                    icon: const Icon(
                                      Icons.edit_outlined,
                                      color: DashboardColors.primary,
                                      size: 20,
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: context.dashSpacing * 0.3),
                              const Divider(
                                height: 1,
                                color: DashboardColors.border,
                              ),
                              SizedBox(height: context.dashSpacing * 0.25),
                              Text(
                                l10n.adminPatientsPreviousSession,
                                style: theme.textTheme.labelMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: DashboardColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              if (patient.previousSession == null ||
                                  patient.previousSession!.id.isEmpty)
                                Text(
                                  l10n.adminPatientsNoPreviousSession,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textMuted,
                                  ),
                                )
                              else ...[
                                Text(
                                  _formatDateTime(
                                    patient.previousSession!.scheduledAt,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Align(
                                  alignment: AlignmentDirectional.centerStart,
                                  child: AdminStatusBadge.sessionStatus(
                                    context,
                                    patient.previousSession!.status,
                                    isPastScheduled:
                                        _isPastScheduledNotCompleted(
                                          patient.previousSession!,
                                        ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  bool _hasCondition(AdminPatientRecord patient) {
    final condition = patient.condition?.trim();
    return condition != null && condition.isNotEmpty;
  }

  bool _hasGender(AdminPatientRecord patient) {
    final gender = patient.gender?.trim();
    return gender != null && gender.isNotEmpty;
  }

  bool _isPastScheduledNotCompleted(AdminPreviousSession session) {
    final scheduledAt = session.scheduledAt;
    if (scheduledAt == null) {
      return false;
    }
    return session.status == 'scheduled' &&
        scheduledAt.isBefore(DateTime.now());
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) {
      return AppLocalizations.of(context)!.adminPatientsUnknownDate;
    }

    final local = date.toLocal();
    return '${DateFormat('d MMM yyyy').format(local)} • ${DateFormat('HH:mm').format(local)}';
  }
}
