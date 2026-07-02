import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../data/admin_features_repository.dart';
import '../../providers/admin_features_provider.dart';
import '../../widgets/admin_page_scaffold.dart';
import '../../widgets/admin_status_badge.dart';
import '../../widgets/admin_ui_components.dart';
import '../../widgets/dashboard_bottom_nav.dart';
import '../../widgets/dashboard_layout.dart';

class AdminPatientsScreen extends ConsumerStatefulWidget {
  const AdminPatientsScreen({super.key});

  @override
  ConsumerState<AdminPatientsScreen> createState() => _AdminPatientsScreenState();
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
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
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

  List<String> get _conditions {
    final values = _patients
        .map((patient) => patient.condition?.trim())
        .whereType<String>()
        .where((value) => value.isNotEmpty)
        .toSet()
        .toList()
      ..sort();
    return values;
  }

  List<AdminPatientRecord> get _filteredPatients {
    final query = _searchQuery.trim().toLowerCase();
    return _patients.where((patient) {
      final matchesSearch = query.isEmpty ||
          patient.fullName.toLowerCase().contains(query) ||
          (patient.condition ?? '').toLowerCase().contains(query);
      final matchesCondition = _conditionFilter == null ||
          _conditionFilter!.isEmpty ||
          patient.condition == _conditionFilter;
      return matchesSearch && matchesCondition;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AdminPageScaffold(
      title: 'Patients',
      currentNav: DashboardNavItem.patients,
      actions: [
        IconButton(
          tooltip: 'Patient Assignments',
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
                    AdminErrorCard(message: _error!, onRetry: _load),
                  AdminSearchField(
                    hintText: 'Search patients or condition',
                    onChanged: (value) => setState(() => _searchQuery = value),
                  ),
                  SizedBox(height: context.dashSpacing * 0.75),
                  if (_conditions.isNotEmpty)
                    DropdownButtonFormField<String?>(
                      initialValue: _conditionFilter,
                      decoration: const InputDecoration(
                        labelText: 'Filter by condition',
                      ),
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('All conditions'),
                        ),
                        ..._conditions.map(
                          (condition) => DropdownMenuItem<String?>(
                            value: condition,
                            child: Text(condition),
                          ),
                        ),
                      ],
                      onChanged: (value) => setState(() => _conditionFilter = value),
                    ),
                  SizedBox(height: context.dashSpacing),
                  if (_filteredPatients.isEmpty)
                    const AdminEmptyCard(message: 'No patients found.')
                  else
                    ..._filteredPatients.map(
                      (patient) => Padding(
                        padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                        child: AdminSurfaceCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const AdminIconCircle(
                                    icon: Icons.person_outline_rounded,
                                    color: AdminDashboardColors.primary,
                                    background: AdminDashboardColors.blueSoft,
                                    size: 44,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          patient.fullName,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.titleMedium?.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: AdminDashboardColors.textPrimary,
                                          ),
                                        ),
                                        if (patient.condition != null &&
                                            patient.condition!.isNotEmpty) ...[
                                          const SizedBox(height: 8),
                                          Align(
                                            alignment: Alignment.centerLeft,
                                            child: AdminStatusBadge(
                                              label: patient.condition!,
                                              color: AdminDashboardColors.primary,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              if (patient.gender != null) ...[
                                SizedBox(height: context.dashSpacing * 0.25),
                                Text(
                                  patient.gender!,
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: AdminDashboardColors.textSecondary,
                                  ),
                                ),
                              ],
                              SizedBox(height: context.dashSpacing * 0.5),
                              const Divider(height: 1, color: AdminDashboardColors.border),
                              SizedBox(height: context.dashSpacing * 0.5),
                              Text(
                                'Previous Session',
                                style: theme.textTheme.labelMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: AdminDashboardColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: context.dashSpacing * 0.35),
                              if (patient.previousSession == null ||
                                  patient.previousSession!.id.isEmpty)
                                Text(
                                  'No previous session',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: AdminDashboardColors.textMuted,
                                  ),
                                )
                              else ...[
                                Text(
                                  _formatDateTime(patient.previousSession!.scheduledAt),
                                  style: theme.textTheme.bodyMedium,
                                ),
                                SizedBox(height: context.dashSpacing * 0.35),
                                AdminStatusBadge.sessionStatus(
                                  patient.previousSession!.status,
                                  isPastScheduled: _isPastScheduledNotCompleted(
                                    patient.previousSession!,
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

  bool _isPastScheduledNotCompleted(AdminPreviousSession session) {
    final scheduledAt = session.scheduledAt;
    if (scheduledAt == null) {
      return false;
    }
    return session.status == 'scheduled' && scheduledAt.isBefore(DateTime.now());
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) {
      return 'Unknown date';
    }
    final local = date.toLocal();
    return '${local.day}/${local.month}/${local.year} ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
  }
}
